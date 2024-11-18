import * as fs from 'node:fs';
import * as path from 'node:path';
import Database from 'better-sqlite3';
import {SqliteError} from 'better-sqlite3';
import {WordbookError} from './errors';
import WordbookQueryBuilder from './WordbookQueryBuilder';

type DBWordDataRow = {
    id : number,
    word : string,
    data : string,
    total:number,
    priority_meaning_indexes:string,
    correct:number,
    incorrect:number
    incorrect_rate:number,
}

class Wordbook {
    #path:string;
    #db:Database;
    #queryBuilder = new WordbookQueryBuilder()

    constructor(target:string) {
        this.#path = target;
        try {
            this.#db = new Database(this.#path);
        }
        catch(e:any) {
            throw new Error(`Failed to open database '${path}' : ${e.message}`);
        }
        
        const builder = this.#queryBuilder;
        const query = `
            ${ builder.createTableWordbookQuery() }
            ${ builder.createTableQuizScoreQuery() }
            ${ builder.createViewWordbookQuery() }
        `;
        
        this.#db.exec(query);
    }

    /**
     * 북마크 추가, 이미 단어가 존재한다면 WordbookError 발생
     * @param word
     * @param data
     */
    addWord(word:string, data:object) {
        const transaction = this.#db.transaction(() => {
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const jsonData = JSON.stringify(data);
            const queryWordbook = this.#db.prepare(
                'INSERT INTO Wordbook(word, data, added_date) VALUES($word, $data, $currentTimestamp)'
            );
            const queryWordQuiz = this.#db.prepare(
                'INSERT INTO QuizScore(word) VALUES($word)'
            );
            queryWordbook.run({word, data:jsonData, currentTimestamp});
            queryWordQuiz.run({word});
        });
        
        try {
            transaction();
        }
        catch(e) {
            if (e instanceof Error) {
                if (e instanceof SqliteError) {
                    throw new WordbookError(`Query Failed : ${e.message}`);
                }
                else {
                    throw e;
                }
            }
            else {
                throw new Error(`Unknown error : ${e}`);
            }
        }
    }

    /**
     * 단어 제거, 단어가 존재하지 않으면 아무것도 하지 않음
     * @param word 
     */
    removeWord(word:string) {
        const transaction = this.#db.transaction(() => {
            const queryWordbook = this.#db.prepare(
                'DELETE FROM Wordbook WHERE word = $word'
            );
            const queryWordQuiz = this.#db.prepare(
                'DELETE FROM QuizScore WHERE word = $word'
            );
            queryWordbook.run({word});
            queryWordQuiz.run({word});
        });

        transaction();
    }

    /**
     * 
     * @param word 
     * @param indexes 
     */
    updateWordMeaningPriority(word:string, indexes:number[]) {
        const query = `
            UPDATE Wordbook
            SET priority_meaning_indexes = $indexes
            WHERE word = $word;
        `;
        const update = this.#db.prepare(query);
        update.run({word, indexes:JSON.stringify(indexes)});
    }

    resetScore(word:string) {
        const query = this.#db.prepare(
            'UPDATE QuizScore SET total = 0, correct = 0, incorrect = 0 WHERE word = $word'
        );
        query.run({word});
    }

    /**
     * 퀴즈 정답수 증가
     */
    addWordCorrectCount(word:string) {
        const query = this.#db.prepare(
            `
            UPDATE QuizScore
            SET total = total + 1, correct = correct + 1
            WHERE word = $word
            `
        );
        query.run({word});
    }

    /**
     * 퀴즈 오답수 증가
     */
    addWordIncorrectCount(word:string) {
        const query = this.#db.prepare(
            `
            UPDATE QuizScore
            SET total = total + 1, incorrect = incorrect + 1
            WHERE word = $word
            `
        );
        query.run({word});
    }

    /**
     * Wordbook DB에서 단어를 검색해 반환
     * 
     * @returns 단어가 존재하지 않으면 undefined 반환
    */
    getWord(word:string):WordData|undefined {
        const select = this.#db.prepare(
            `
            SELECT *
            FROM view_Wordbook
            WHERE word = $word
            LIMIT 1
            `
        );
        const result = select.all({word});

        if (result.length === 0) {
            return undefined;
        }
        else {
            this.#parseMultipleWordDataMeaning(result);

            return result[0] as WordData;
        }
    }
    
    /**
     * Wordbook DB에서 조건에 맞는 Word 목록을 검색해 목록을 반환
     */
    getWords(
        conditions:WordSelectCondition[],
        option:WordSelectOption = { 
            order: 'sequence'
        }
    ):WordData[] {
        const builder = this.#queryBuilder;
        const wordSet = new Set<string>();
        const words:DBWordDataRow[][] = [];
        let result:WordData[] = [];
        
        const tryAddWordToResult = (row:DBWordDataRow) => {
            if (!wordSet.has(row.word)) {
                this.#parseSingleWordDataMeaning(row);
                
                result.push(row as unknown as WordData);
                wordSet.add(row.word);
            }
        }

        for (const condition of conditions) {
            const query = builder.selectWordsQuery(condition)
            const select = this.#db.prepare(query);
            const rows = select.all() as DBWordDataRow[];
            words.push(rows);
            
            if (condition.shuffle) {
                this.#shuffle(rows, condition.shuffleGroupSize);
            }
        }

        if (words.length === 0) {
            // nothing to do
        }
        else if (words.length === 1) {
            this.#parseMultipleWordDataMeaning(words[0]);
            result = words[0] as unknown as WordData[];
        }
        else if (option.order === 'sequence') {
            for (const rows of words) {
                for (const row of rows) {
                    tryAddWordToResult(row);
                }
            }
        }
        else if (option.order === 'interleave') {
            let index = 0;
            let currentWords = [...words];
            let nextWords = currentWords;
            while (currentWords.length > 0) {
                for (const rows of currentWords) {
                    if (index >= rows.length) {
                        if (nextWords === currentWords) {
                            nextWords = [...currentWords];
                        }

                        const i = nextWords.indexOf(rows);
                        if (i > -1) {
                            nextWords.splice(i, 1);
                        }
                        continue;
                    }

                    tryAddWordToResult(rows[index]);
                }
                if (nextWords !== currentWords) {
                    currentWords = nextWords;
                }

                index++;
            }
        }

        return result;
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
    
    #parseSingleWordDataMeaning(target:DBWordDataRow) {
        target.data = JSON.parse(target.data) as any;
        target.priority_meaning_indexes = JSON.parse(target.priority_meaning_indexes) as any;
    }

    /**
     * DB에서 가져온 data, priority_meaning_indexes을 JSON으로 변환
     * 
     * 인자로 가져온 DBWordDataRow 타입을 WordData 포맷으로 변환함
     */
    #parseMultipleWordDataMeaning(target:DBWordDataRow[]) {
        for (const data of target) {
            data.data = JSON.parse(data.data) as any;
            data.priority_meaning_indexes = JSON.parse(data.priority_meaning_indexes) as any;
        }
    }

    getWordCount(option:WordSelectOption, conditions:WordSelectCondition[]):number {
        const builder = this.#queryBuilder;
        const subqueries:string[] = [];
        for (const condition of conditions) {
            subqueries.push(builder.selectWordsQuery(condition));
        }

        const query = builder.selectCountFromSubquery(subqueries);
        const select = this.#db.prepare(query);
        const data = select.all();

        return data[0];
    }

    clear() {
        const queryWordbook = this.#db.prepare(
            'DELETE FROM Wordbook'
        );
        const queryWordQuiz = this.#db.prepare(
            'DELETE FROM QuizScore'
        );
        queryWordbook.run();
        queryWordQuiz.run();
    }

    drop() {
        this.close();

        if (fs.existsSync(this.#path)) {
            fs.unlinkSync(this.#path);
        }
    }

    close() {
        if (this.#db) {
            this.#db.close();
            this.#db = null;
        }
    }
}


export default Wordbook;