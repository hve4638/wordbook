import * as fs from 'fs';
import * as path from 'path';
import { describe, test, expect, afterAll, beforeAll, afterEach, beforeEach } from '@jest/globals'
import Wordbook from './Wordbook';
import exp from 'constants';
import { get } from 'http';
import { WordbookError } from './errors';

const documentsPath = path.join(process.env['USERPROFILE'] ?? '', 'Documents');
const testPath = path.join(documentsPath, 'Wordbook', 'test');


const getResult = (id:number, word:string, data:object) => {
    return {id, word, data:JSON.stringify(data)};
}
    
const getScore = (total:number, correct:number, incorrect:number) => {
    return { total, correct, incorrect };
}



describe('Wordbook', () => {
    const target = path.join(testPath, 'wordbook.db');
    let wordbook:Wordbook;
    
    beforeAll(() => {
        if (fs.existsSync(target)) {
            fs.unlinkSync(target);
        }
        fs.mkdirSync(testPath, {recursive:true});
        wordbook = new Wordbook(target);
    });

    afterAll(() => {
        wordbook.drop();
    });

    beforeEach(() => {
        wordbook.clear();
    });

    for(let i = 0; i < 2; i++) // 테스트 종료후 데이터가 정리되는지 확인하기 위한 중복 테스트
    test('Add/Get', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});

        const actual = wordbook.getLatest()

        expect(actual).toEqual(
            [
                getResult(1, 'apple', {meaning:'사과'})
            ]
        );
    })
    test('Add/Remove', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.removeWord('apple');

        const actual = wordbook.getLatest()

        expect(actual).toEqual([]);
    });
    test('GetLatest', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWord('banana', {meaning:'바나나'});

        const actual = wordbook.getLatest()

        expect(actual).toEqual(
            [
                getResult(2, 'banana', {meaning:'바나나'}),
                getResult(1, 'apple', {meaning:'사과'}),
            ]
        );
    });
    test('GetOldest', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWord('banana', {meaning:'바나나'});

        const actual = wordbook.getOldest()

        expect(actual).toEqual(
            [
                getResult(1, 'apple', {meaning:'사과'}),
                getResult(2, 'banana', {meaning:'바나나'}),
            ]
        );
    });

    test('Add Duplicate', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        
        try {
            wordbook.addWord('apple', {meaning:'사과'});
            throw new Error('Expect Error but not');
        }
        catch(e) {
            if (e instanceof WordbookError) {
                // Expected
            }
            else {
                throw e;
            }
        }
    });

    test('Remove Nonexistent', ()=>{
        wordbook.removeWord('apple');
    });
});

describe('Wordbook Quiz', () => {
    const target = path.join(testPath, 'quiz.db');
    let wordbook:Wordbook;
    beforeAll(() => {
        if (fs.existsSync(target)) {
            fs.unlinkSync(target);
        }
        fs.mkdirSync(testPath, {recursive:true});
        wordbook = new Wordbook(target);
    });

    afterAll(() => {
        wordbook.drop();
    });

    beforeEach(() => {
        wordbook.clear();
    });

    test('GetScore', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.getScore('apple');

        const actual = wordbook.getScore('apple');
        expect(actual).toEqual(getScore(0,0,0));
    });

    test('AddCorrectScore', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.getScore('apple');
        wordbook.addWordscoreCorrect('apple');

        const actual = wordbook.getScore('apple');
        expect(actual).toEqual(getScore(1,1,0));
    });
    test('addWordscoreIncorrect', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.getScore('apple');
        wordbook.addWordscoreIncorrect('apple');

        const actual = wordbook.getScore('apple');
        expect(actual).toEqual(getScore(1,0,1));
    });
    test('GetMoreIncorrect', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWord('banana', {meaning:'바나나'});
        wordbook.addWord('cherry', {meaning:'체리'});
        wordbook.addWordscoreIncorrect('apple');
        wordbook.addWordscoreIncorrect('banana');
        wordbook.addWordscoreIncorrect('banana');

        const actual = wordbook.getMoreIncorrect();
        expect(actual).toEqual([
            getResult(2, 'banana', {meaning:'바나나'}),
            getResult(1, 'apple', {meaning:'사과'}),
            getResult(3, 'cherry', {meaning:'체리'}),
        ]);
    });
    test('GetLessIncorrect', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWord('banana', {meaning:'바나나'});
        wordbook.addWord('cherry', {meaning:'체리'});
        wordbook.addWordscoreIncorrect('apple');
        wordbook.addWordscoreIncorrect('banana');
        wordbook.addWordscoreIncorrect('banana');

        const actual = wordbook.getLessIncorrect();
        expect(actual).toEqual([
            getResult(3, 'cherry', {meaning:'체리'}),
            getResult(1, 'apple', {meaning:'사과'}),
            getResult(2, 'banana', {meaning:'바나나'}),
        ]);
    });
    test('GetLessFrequency', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWord('banana', {meaning:'바나나'});
        wordbook.addWord('cherry', {meaning:'체리'});
        wordbook.addWordscoreIncorrect('apple');
        wordbook.addWordscoreIncorrect('banana');
        wordbook.addWordscoreIncorrect('banana');

        const actual = wordbook.getLessFrequency();
        expect(actual).toEqual([
            getResult(3, 'cherry', {meaning:'체리'}),
            getResult(1, 'apple', {meaning:'사과'}),
            getResult(2, 'banana', {meaning:'바나나'}),
        ]);
    });
    test('GetMoreFrequency', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWord('banana', {meaning:'바나나'});
        wordbook.addWord('cherry', {meaning:'체리'});
        wordbook.addWordscoreIncorrect('apple');
        wordbook.addWordscoreIncorrect('banana');
        wordbook.addWordscoreIncorrect('banana');

        const actual = wordbook.getMoreFrequency();
        expect(actual).toEqual([
            getResult(2, 'banana', {meaning:'바나나'}),
            getResult(1, 'apple', {meaning:'사과'}),
            getResult(3, 'cherry', {meaning:'체리'}),
        ]);
    });
});
