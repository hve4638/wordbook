import * as fs from 'node:fs';
import * as path from 'node:path';
import SQLite3 from 'better-sqlite3';
import WordbookQueryBuilder from './WordbookQueryBuilder';
import { getUNIXTimestamp } from './utils';
import { RawDBWord, DBWord, RawDBBookmarkView, DBBookmarkView, Meaning } from './types/db';
import { WordbookError } from './errors';
import { OrderByQuery, WhereQuery } from './query';
import { ORDER } from './types';
import { BookmarkViewFields } from './fields'

const qb = new WordbookQueryBuilder();
type Database = SQLite3.Database;

class Wordbook {
    #path:string;
    #db:Database;

    constructor(target:string=':memory:') {
        if (target === ':memory:') {
            console.log('Using in-memory database');
        }
        
        this.#path = target;
        try {
            this.#db = new SQLite3(this.#path);
        }
        catch(e:any) {
            throw new Error(`Failed to open database '${path}' : ${e.message}`);
        }
        
        const quries = qb.createTablesAndViews();
        for (const query of quries) {
            query.exec(this.#db);
        }

        const hasTrigger = qb.selectAfterInsertBookmarkTrigger().get(this.#db);
        if (!hasTrigger) {
            qb.createAfterInsertBookmarkTrigger().exec(this.#db);
        }
    }

    /**
     * 단어 캐시 추가
     */
    addWord(word:string, meanings:WordMeaning[]) {
        qb.insertWord({
            word,
            meanings:JSON.stringify(meanings)
        }).run(this.#db);
    }

    editWord(word:string, meanings:WordMeaning[]) {
        qb.updateWord({
            word,
            meanings:JSON.stringify(meanings)
        }).run(this.#db);
    }
    
    getWord(word:string):DBWord|undefined {
        const rawDBWord = qb.selectWord({word}).get(this.#db);

        if (!rawDBWord) return;
        return this.#convertDBWord(rawDBWord);
    }

    deleteWord(word:string) {
        qb.deleteWord({word}).run(this.#db);
    }

    #convertDBWord(rawDBWord:RawDBWord):DBWord {
        try {
            rawDBWord.meanings = JSON.parse(rawDBWord.meanings);
            return rawDBWord as unknown as DBWord;
        }
        catch(e) {
            console.log('');
            console.log('');
            console.log('');
            console.log(e);
            console.log(rawDBWord);
            console.log('');
            console.log('');
            console.log('');
            throw new WordbookError(`Failed to parse meaning of word '${rawDBWord.word}'`);
        }
    }
    
    addBookmark(word:string) {
        const addedDate = getUNIXTimestamp();
        qb.insertBookmark({word, addedDate}).run(this.#db);
    }

    getBookmark(word:string):BookmarkData|undefined {
        const rawDBBookmark = qb.selectBookmark({word}).get(this.#db);

        if (!rawDBBookmark) return;
        return this.#convertDBBookmark(rawDBBookmark);
    }

    getBookmarks(
        conditions:BookmarkSelectCondition[],
        option:WordSelectOption = { 
            order: 'sequence'
        }
    ):BookmarkData[] {
        const words:DBBookmarkView[][] = [];
        for (const condition of conditions) {
            this.#validateWordSelectCondition(condition);
            const where = this.#makeBookmarkWhereQuery(condition);
            const orderBy = this.#makeBookmarkOrderByQuery(condition);

            const rawDBBookmarks = qb.selectBookmarks({
                where,
                orderBy,
                limit : condition.limit,
                offset : condition.offset
            }).all(this.#db);

            const dbBookmarks = rawDBBookmarks.map((row)=>this.#convertDBBookmark(row));
            if (condition.shuffle) {
                this.#shuffle(dbBookmarks, condition.shuffleGroupSize);
            }
            words.push(dbBookmarks);
        }

        return this.#mergeBookmarkRows(words, option);
    }

    #validateWordSelectCondition(condition:BookmarkSelectCondition) {
        // 서로 대립되는 조건이 있다면 예외 발생
        if (condition.highQuizFrequency && condition.lowQuizFrequency) {
            throw new WordbookError('highQuizFrequency and lowQuizFrequency are mutually exclusive');
        }
        if (condition.highQuizIncorrect && condition.lowQuizIncorrect) {  
            throw new WordbookError('highQuizIncorrect and lowQuizIncorrect are mutually exclusive');
        }
        if (condition.oldest && condition.latest) {
            throw new WordbookError('oldest and latest are mutually exclusive');
        }
    }
    
    #makeBookmarkWhereQuery(condition:BookmarkSelectCondition):WhereQuery {
        const where = new WhereQuery(); 
        if (condition.lowIncorrectRateLimit) {
            where.add(
                `${BookmarkViewFields.quizIncorrectRate} >= $lowIncorrectRateLimit`, 
                { lowIncorrectRateLimit : condition.lowIncorrectRateLimit }
            );
        }
        if (condition.highIncorrectRateLimit) {
            where.add(
                `${BookmarkViewFields.quizIncorrectRate} >= $highIncorrectRateLimit`, 
                { highIncorrectRateLimit : condition.highIncorrectRateLimit }
            );
        }
        if (condition.lowFrequencyLimit) {
            where.add(
                `${BookmarkViewFields.quizTotal} >= $lowFrequencyLimit`,
                { lowFrequencyLimit : condition.lowFrequencyLimit }
            );
        }
        if (condition.highFrequencyLimit) {
            where.add(
                `${BookmarkViewFields.quizTotal} <= $highFrequencyLimit`,
                { highFrequencyLimit : condition.highFrequencyLimit }
            );
        }

        return where;
    }

    #makeBookmarkOrderByQuery(condition:BookmarkSelectCondition):OrderByQuery {
        const orderBy = new OrderByQuery();
        /*
            ORDER BY 순서
            incorrect_rate
            total
            incorrect
            added_date
        */

        let totalOrder:ORDER|undefined;
        if (condition.highQuizFrequency) totalOrder = ORDER.HIGH;
        else if (condition.lowQuizFrequency) totalOrder = ORDER.LOW;

        let incorrectOrder:ORDER|undefined;
        if (condition.highQuizIncorrect) incorrectOrder = ORDER.HIGH;
        else if (condition.lowQuizIncorrect) incorrectOrder = ORDER.LOW;
        
        if (incorrectOrder) orderBy.add(BookmarkViewFields.quizIncorrectRate, incorrectOrder);
        if (totalOrder) orderBy.add(BookmarkViewFields.quizTotal, totalOrder);
        if (incorrectOrder) orderBy.add(BookmarkViewFields.quizIncorrect, incorrectOrder);

        if (condition.oldest) {
            orderBy.add(BookmarkViewFields.addedDate, ORDER.LOW);
            orderBy.add(BookmarkViewFields.id, ORDER.LOW);
        }
        else if (condition.latest) {
            orderBy.add(BookmarkViewFields.addedDate, ORDER.HIGH);
            orderBy.add(BookmarkViewFields.id, ORDER.HIGH);
        }
        else {
            orderBy.add(BookmarkViewFields.id, ORDER.HIGH);
        }

        return orderBy;
    }

    #convertDBBookmark(rawDBWord:RawDBBookmarkView):DBBookmarkView {
        try {
            rawDBWord.meanings = JSON.parse(rawDBWord.meanings);
            return rawDBWord as unknown as DBBookmarkView;
        }
        catch(e) {
            throw new WordbookError(`Failed to parse meaning of word '${rawDBWord.word}'`);
        }
    }

    #mergeBookmarkRows(words:DBBookmarkView[][], option:WordSelectOption):DBBookmarkView[] {
        const wordSet = new Set<string>();
        const result:DBBookmarkView[] = [];

        const addRow = (row)=>{
            if (!wordSet.has(row.word)) {
                wordSet.add(row.word);
                result.push(row);
            }
        }

        if (words.length === 0) {
            return []
        }
        else if (words.length === 1){
            return words[0];
        }
        else if (option.order === 'sequence') {
            for (const rows of words) {
                for (const row of rows) {
                    addRow(row);
                }
            }
        }
        else if (option.order === 'interleave') {
            let index = 0;
            let remainWords = [...words];
            let nextWords = remainWords;
            while (remainWords.length > 0) {
                for (const rows of remainWords) {
                    if (index < rows.length) {
                        addRow(rows[index]);
                    }
                    else {
                        if (nextWords === remainWords) {
                            nextWords = [...remainWords];
                        }

                        const i = nextWords.indexOf(rows);
                        if (i > -1) {
                            nextWords.splice(i, 1);
                        }
                    }
                }
                if (nextWords !== remainWords) {
                    remainWords = nextWords;
                }

                index++;
            }
        }

        return result;
    }
    
    deleteBookmark(word:string) {
        qb.deleteBookmark({word}).run(this.#db);
    }

    increaseBookmarkQuizScore(word:string, correct:number, incorrect:number) {
        qb.increaseQuizScore({word, correct, incorrect}).run(this.#db);
    }

    resetBookmarkQuizScore(word:string, correct:number, incorrect:number) {
        qb.updateQuizScore({word, correct, incorrect}).run(this.#db);
    }
    
    #shuffle(data:any[], shuffleGroupSize?:number) {
        shuffleGroupSize ??= data.length;

        for (let i = 0; i < data.length; i += shuffleGroupSize) {
            this.#partShuffle(data, i, Math.min(i + shuffleGroupSize, data.length));
        }
    }

    /**
     * Fisher-Yates 셔플 알고리즘
     */
    #partShuffle(data:any[], start:number, end:number) {
        const size = end - start;
        for (let i = size - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            
            [data[start+i], data[start+j]] = [data[start+j], data[start+i]];
        }
    }
    
    getBookmarkCount():number {
        return qb.selectBookmarkCount().get(this.#db)?.count ?? 0;
    }

    clear() {
        qb.deleteAllBookmarks().run(this.#db);
    }

    drop() {
        this.close();

        if (this.#path !== ':memory:' && fs.existsSync(this.#path)) {
            fs.unlinkSync(this.#path);
        }
    }

    close() {
        this.#db.close();
    }
}


export default Wordbook;