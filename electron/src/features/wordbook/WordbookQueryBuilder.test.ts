import * as path from 'path';
import { describe, test, expect, afterAll, beforeAll, afterEach, beforeEach } from '@jest/globals'
import Database, {SqliteError} from 'better-sqlite3';
import WordbookQueryBuilder from './WordbookQueryBuilder';
import { QueryError } from './errors';
import { WhereQuery } from './query';

describe('WordbookQuery', () => {
    const queryBuilder = new WordbookQueryBuilder();
    let db:Database.Database;
    beforeEach(()=>{
        db = new Database(':memory:');
    })
    afterEach(()=>{
        db.close();
    })

    function createTablesAndViews() {
        const queries = queryBuilder.createTablesAndViews();
        for (const query of queries) {
            query.exec(db);
        }
    }
    function createTriggers() {
        const queries = queryBuilder.createTriggers();
        for (const query of queries) {
            query.exec(db);
        }
    }

    function insertWord(word:string, meanings:string='[]') {
        queryBuilder.insertWord({word , meanings}).run(db);
    }
    function updateWord(word:string, meanings:string='[]') {
        queryBuilder.updateWord({word , meanings}).run(db);
    }
    function insertBookmark(word:string, addedDate:number=0) {
        queryBuilder.insertBookmark({word:word, addedDate}).run(db);
    }
    function increaseQuizScore(word:string, correct:number=0, incorrect:number=0) {
        for(let i=0; i<correct; i++) {
            queryBuilder.increaseQuizCorrect({word:word}).run(db);
        }
        for(let i=0; i<incorrect; i++) {
            queryBuilder.increaseQuizIncorrect({word:word}).run(db);
        }
    }
    function increaseQuizCorrect(word:string, count:number=1) {
        for(let i=0; i<count; i++) {
            queryBuilder.increaseQuizCorrect({word:word}).run(db);
        }
    }
    function increaseQuizIncorrect(word:string, count:number=1) {
        for(let i=0; i<count; i++) {
            queryBuilder.increaseQuizIncorrect({word:word}).run(db);
        }
    }
    function selectBookmark(word:string) {
        return queryBuilder.selectBookmark({word}).get(db);
    }
    function makeBookmarkAndScore(word:string, correct:number, incorrect:number) {
        insertWord(word);
        insertBookmark(word);
        increaseQuizScore(word, correct, incorrect);
    }

    test('테이블 생성 쿼리 검사', ()=>{
        createTablesAndViews();
    });

    test('select Words with no data', ()=>{
        createTablesAndViews();
        const expected = undefined;
        const actual = queryBuilder.selectWord({ word : 'no-word' }).get(db);
        
        expect(actual).toEqual(expected);
    });

    test('insert Words', ()=>{
        createTablesAndViews();
        const expected = { meanings:'[]', word:'test'};
        
        queryBuilder.insertWord(expected).run(db);
        const actual = queryBuilder.selectWord({ word : expected.word }).get(db);
        
        expect(actual).toEqual(expected);
    });

    test('update Words', ()=>{
        createTablesAndViews();
        
        const oldMeaning = JSON.stringify([{from:'word', to:'단서', fromType:'n'}]);
        const newMeaning = JSON.stringify([{from:'word', to:'단어', fromType:'n'}]);
        insertWord('word', oldMeaning);
        {
            const expected = { meanings:oldMeaning, word:'word'};
            const actual = queryBuilder.selectWord({ word : expected.word }).get(db);
            expect(actual).toEqual(expected);
        }

        updateWord('word', newMeaning);
        {
            const expected = { meanings:newMeaning, word:'word'};
            const actual = queryBuilder.selectWord({ word : expected.word }).get(db);
            expect(actual).toEqual(expected);
        }
    })

    test('중복 트리거 생성 테스트', ()=>{
        const selectTrigger = ()=>{
            return queryBuilder.selectAfterInsertBookmarkTrigger().get(db);
        }
        createTablesAndViews();
        {
            const actual = selectTrigger();
            expect(actual).toBeUndefined();
        }
        createTriggers();
        {
            const actual = selectTrigger();
            expect(actual).not.toBeUndefined();
        }
    });

    /**
     * Bookmark 테이블 추가 테스트
     * 
     * Bookmark는 Words 테이블에 존재하는 단어만 추가할 수 있는지 테스트
     */
    test('insert Bookmark', ()=>{
        createTablesAndViews();

        queryBuilder.insertWord({word:'word', meanings:'[]'}).run(db);
        {
            const params = { 'word':'word', 'addedDate': 0 }
            expect(
                ()=>queryBuilder.insertBookmark(params).run(db)
            ).not.toThrow();
        }
        {
            const params = { 'word':'no-word', 'addedDate': 0 }
            expect(
                ()=>queryBuilder.insertBookmark(params).run(db)
            ).toThrow();
        }
    });

    test('select Bookmark', ()=>{
        createTablesAndViews();
        createTriggers();

        queryBuilder.insertWord({word:'word', meanings:'[]'}).run(db);
        const param = { 'word':'word', 'addedDate': 0 }
        queryBuilder.insertBookmark(param).run(db);

        const expected = {
            ...param,
            id : expect.any(Number)
        };
        const actual = queryBuilder.selectRawBookmark({word:'word'}).get(db);
        expect(actual).toEqual(expected);
    });
    test('select BookmarkQuizScore', ()=>{
        createTablesAndViews();
        createTriggers();

        queryBuilder.insertWord({word:'word', meanings:'[]'}).run(db);
        const param = { 'word':'word', 'addedDate': 0 }
        queryBuilder.insertBookmark(param).run(db);

        const expected = {
            word: param.word,
            total : 0,
            correct : 0,
            incorrect : 0,
        };
        const actual = queryBuilder.selectRawBookmarkQuizScore({word:'word'}).get(db);
        expect(actual).toEqual(expected);
    });
    test('select BookmarkView', ()=>{
        createTablesAndViews();
        createTriggers();

        insertWord('word');
        insertBookmark('word', 0);

        const expected:BookmarkData = {
            id : expect.any(Number) as any,
            word: 'word',
            meanings : expect.any(String) as any,
            addedDate : 0,
            quizTotal : 0,
            quizCorrect : 0,
            quizIncorrect : 0,
            quizIncorrectRate : 0,
        };
        const actual = queryBuilder.selectBookmark({word:'word'}).get(db);
        expect(actual).toEqual(expected);
    });
    test('퀴즈 점수', ()=>{
        createTablesAndViews();
        createTriggers();

        insertWord('word');
        insertBookmark('word');
        increaseQuizCorrect('word', 3);
        increaseQuizIncorrect('word', 2);

        const expected = {
            quizTotal : 5,
            quizCorrect : 3,
            quizIncorrect : 2,
        };
        const result = selectBookmark('word')!;
        const actual = {
            quizTotal : result.quizTotal,
            quizCorrect : result.quizCorrect,
            quizIncorrect : result.quizIncorrect,
        }
        expect(actual).toEqual(expected);
    })

    test('select Bookmarks', ()=>{
        createTablesAndViews();
        createTriggers();

        makeBookmarkAndScore('word1', 10, 0);
        makeBookmarkAndScore('word2', 8, 2);
        makeBookmarkAndScore('word3', 7, 3);
        makeBookmarkAndScore('word4', 5, 5);
        {
            const where = new WhereQuery();
            where.add('quizCorrect >= 8');
            const result = queryBuilder.selectBookmarks({
                where: where
            }).all(db);

            const expected = [ 'word1', 'word2']
            const actual = result.map((row)=>row.word);
            expect(actual).toEqual(expected);
        }
        {
            const where = new WhereQuery();
            where.add('quizTotal = 10');
            const result = queryBuilder.selectBookmarks({
                where: where
            }).all(db);

            const expected = [ 'word1', 'word2', 'word3', 'word4' ]
            const actual = result.map((row)=>row.word);
            expect(actual).toEqual(expected);
        }
        {
            const where = new WhereQuery();
            where.add('quizCorrect <= 7');
            where.add('quizIncorrect <= 7');
            const result = queryBuilder.selectBookmarks({
                where: where
            }).all(db);

            const expected = [ 'word3', 'word4' ]
            const actual = result.map((row)=>row.word);
            expect(actual).toEqual(expected);
        }
    });
});
