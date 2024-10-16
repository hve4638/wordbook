import * as fs from 'fs';
import * as path from 'path';
import { describe, test, expect, afterAll, beforeAll, afterEach, beforeEach } from '@jest/globals'
import Wordbook from './Wordbook';
import { WordbookError } from './errors';
import exp from 'constants';

const documentsPath = path.join(process.env['USERPROFILE'] ?? '', 'Documents');
const testPath = path.join(documentsPath, 'Wordbook', 'test');

const getWord = (word:string) => {
    return {
        id : expect.any(Number),
        word,
        data : expect.any(Object),
        added_date : expect.any(Number),
        correct : expect.any(Number),
        incorrect : expect.any(Number),
        total : expect.any(Number),
        incorrect_rate : expect.any(Number),
    };
}

const getResult = (id:number, word:string, data:object=expect.any(Object)) => {
    return {
        id,
        word,
        data,
        added_date : expect.any(Number),
        correct : expect.any(Number),
        incorrect : expect.any(Number),
        total : expect.any(Number),
        incorrect_rate : expect.any(Number),
    };
}
    
const getScore = (total:number, correct:number, incorrect:number) => {
    return {
        id : expect.any(Number),
        word : expect.any(String),
        data : expect.any(Object),
        added_date : expect.any(Number),
        total,
        correct,
        incorrect,
        incorrect_rate : total == 0 ? 0 : (100 * incorrect / total),
    };
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
    test('addWord/getWord', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});

        const actual = wordbook.getWords([{latest: true}])
        expect(actual).toEqual(
            [
                getResult(1, 'apple', {meaning:'사과'})
            ]
        );
    })
    test('Add/Remove', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.removeWord('apple');

        const actual = wordbook.getWords([{latest: true}])
        expect(actual).toEqual([]);
    });
    test('getWords (latest)', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWord('banana', {meaning:'바나나'});

        const actual = wordbook.getWords([{latest: true}]);

        expect(actual).toEqual(
            [
                getResult(2, 'banana', {meaning:'바나나'}),
                getResult(1, 'apple', {meaning:'사과'}),
            ]
        );
    });
    test('getWords (oldest)', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWord('banana', {meaning:'바나나'});

        const actual = wordbook.getWords([{oldest: true}]);

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
    
    const addWordScore = (word:string, correct:number, incorrect:number) => {
        for(let i = 0; i < correct; i++) {
            wordbook.addWordCorrectCount(word);
        }
        for(let i = 0; i < incorrect; i++) {
            wordbook.addWordIncorrectCount(word);
        }
    }

    const presetIncorrectRate = () => {
        wordbook.addWord('P100', {meaning:'-'});
        wordbook.addWord('P90', {meaning:'-'});
        wordbook.addWord('P80', {meaning:'-'});
        wordbook.addWord('P70', {meaning:'-'});
        wordbook.addWord('P60', {meaning:'-'});
        wordbook.addWord('P50', {meaning:'-'});
        wordbook.addWord('P40', {meaning:'-'});
        wordbook.addWord('P30', {meaning:'-'});
        wordbook.addWord('P20', {meaning:'-'});
        wordbook.addWord('P10', {meaning:'-'});
        wordbook.addWord('P0', {meaning:'-'});

        addWordScore('P100', 0, 1);
        addWordScore('P90', 1, 9);
        addWordScore('P80', 2, 8);
        addWordScore('P70', 3, 7);
        addWordScore('P60', 4, 6);
        addWordScore('P50', 5, 5);
        addWordScore('P40', 6, 4);
        addWordScore('P30', 7, 3);
        addWordScore('P20', 8, 2);
        addWordScore('P10', 9, 1);
        addWordScore('P0', 1, 0);
    }
    const presetFrequency = () => {
        wordbook.addWord('F10', {meaning:'-'});
        wordbook.addWord('F9', {meaning:'-'});
        wordbook.addWord('F8', {meaning:'-'});
        wordbook.addWord('F7', {meaning:'-'});
        wordbook.addWord('F6', {meaning:'-'});
        wordbook.addWord('F5', {meaning:'-'});
        wordbook.addWord('F4', {meaning:'-'});
        wordbook.addWord('F3', {meaning:'-'});
        wordbook.addWord('F2', {meaning:'-'});
        wordbook.addWord('F1', {meaning:'-'});
        wordbook.addWord('F0', {meaning:'-'});

        addWordScore('F10', 10, 0);
        addWordScore('F9', 9, 0);
        addWordScore('F8', 8, 0);
        addWordScore('F7', 7, 0);
        addWordScore('F6', 6, 0);
        addWordScore('F5', 5, 0);
        addWordScore('F4', 4, 0);
        addWordScore('F3', 3, 0);
        addWordScore('F2', 2, 0);
        addWordScore('F1', 1, 0);
    }

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

    test('score 0/0/0', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});

        const actual = wordbook.getWord('apple');
        expect(actual).toEqual(getScore(0,0,0));
    });

    test('score 1/1/0', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWordCorrectCount('apple');

        const actual = wordbook.getWord('apple');
        expect(actual).toEqual(getScore(1,1,0));
    });

    test('score 1/0/1', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWordIncorrectCount('apple');

        const actual = wordbook.getWord('apple');
        expect(actual).toEqual(getScore(1,0,1));
    });
    
    /*
        highQuizIncorrect 옵션 
     
        오답률이 높은 순으로 정렬
        오답률이 동일할 경우 오답 수가 많은 순으로 정렬
     */
    test('condtion.highQuizIncorrect', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWord('banana', {meaning:'바나나'});
        wordbook.addWord('cherry', {meaning:'체리'});
        wordbook.addWordIncorrectCount('apple');
        wordbook.addWordIncorrectCount('banana');
        wordbook.addWordIncorrectCount('banana');

        const actual = wordbook.getWords([{highQuizIncorrect: true}]);
        expect(actual).toEqual([
            getResult(2, 'banana', {meaning:'바나나'}),
            getResult(1, 'apple', {meaning:'사과'}),
            getResult(3, 'cherry', {meaning:'체리'}),
        ]);
    });
    test('condition.lowQuizIncorrect', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWord('banana', {meaning:'바나나'});
        wordbook.addWord('cherry', {meaning:'체리'});
        wordbook.addWordIncorrectCount('apple');
        wordbook.addWordIncorrectCount('banana');
        wordbook.addWordIncorrectCount('banana');

        const actual = wordbook.getWords([{lowQuizIncorrect: true}]);
        expect(actual).toEqual([
            getResult(3, 'cherry', {meaning:'체리'}),
            getResult(1, 'apple', {meaning:'사과'}),
            getResult(2, 'banana', {meaning:'바나나'}),
        ]);
    });
    test('condition.lowQuizFrequency', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWord('banana', {meaning:'바나나'});
        wordbook.addWord('cherry', {meaning:'체리'});
        wordbook.addWordIncorrectCount('apple');
        wordbook.addWordIncorrectCount('banana');
        wordbook.addWordIncorrectCount('banana');

        const actual = wordbook.getWords([{lowQuizFrequency: true}]);
        expect(actual).toEqual([
            getResult(3, 'cherry', {meaning:'체리'}),
            getResult(1, 'apple', {meaning:'사과'}),
            getResult(2, 'banana', {meaning:'바나나'}),
        ]);
    });
    test('conditon.highQuizFrequency', ()=>{
        wordbook.addWord('apple', {meaning:'사과'});
        wordbook.addWord('banana', {meaning:'바나나'});
        wordbook.addWord('cherry', {meaning:'체리'});
        wordbook.addWordIncorrectCount('apple');
        wordbook.addWordIncorrectCount('banana');
        wordbook.addWordIncorrectCount('banana');

        const actual = wordbook.getWords([{highQuizFrequency: true}]);
        expect(actual).toEqual([
            getResult(2, 'banana', {meaning:'바나나'}),
            getResult(1, 'apple', {meaning:'사과'}),
            getResult(3, 'cherry', {meaning:'체리'}),
        ]);
    });
    test('condition.lowIncorrectRateLimit', ()=>{
        presetIncorrectRate();

        const actual = wordbook.getWords([{lowIncorrectRateLimit: 50}]);
        expect(actual).toEqual([
            getWord('P50'),
            getWord('P60'),
            getWord('P70'),
            getWord('P80'),
            getWord('P90'),
            getWord('P100'),
        ]);
    });
    test('condition.highIncorrectRateLimit', ()=>{
        presetIncorrectRate();

        const actual = wordbook.getWords([{highIncorrectRateLimit: 50}]);
        expect(actual).toEqual([
            getWord('P0'),
            getWord('P10'),
            getWord('P20'),
            getWord('P30'),
            getWord('P40'),
            getWord('P50'),
        ]);
    });
    test('condition.complex incorrectRateLimit,highIncorrectRateLimit', ()=>{
        presetIncorrectRate();

        const actual = wordbook.getWords(
            [{
                lowIncorrectRateLimit : 30,
                highIncorrectRateLimit: 60
            }]
        );
        expect(actual).toEqual([
            getWord('P30'),
            getWord('P40'),
            getWord('P50'),
            getWord('P60'),
        ]);
    });
    test('condition.union highIncorrectRateLimit or highIncorrectRateLimit', ()=>{
        presetIncorrectRate();

        const actual = wordbook.getWords(
            [
                {
                    highFrequencyLimit: 3,
                    latest: true,
                },
                {
                    highIncorrectRateLimit: 30,
                    latest: true,
                }
            ]
        );
        expect(actual).toEqual([
            getWord('P0'),
            getWord('P100'),
            getWord('P10'),
            getWord('P20'),
            getWord('P30'),
        ]);
    });

    test('option.order sequence', ()=>{
        presetFrequency();

        const actual = wordbook.getWords(
            [
                {
                    highFrequencyLimit : 2,
                    latest: true,
                },
                {
                    lowFrequencyLimit : 8,
                    oldest: true,
                }
            ]
        );
        expect(actual).toEqual([
            getWord('F0'),
            getWord('F1'),
            getWord('F2'),
            getWord('F10'),
            getWord('F9'),
            getWord('F8'),
        ]);
    });

    test('option.order interleave', ()=>{
        presetFrequency();

        const actual = wordbook.getWords(
            [
                {
                    highFrequencyLimit : 2,
                    latest: true,
                },
                {
                    lowFrequencyLimit : 8,
                    oldest: true,
                }
            ],
            {
                order: 'interleave'
            }
        );
        expect(actual).toEqual([
            getWord('F0'),
            getWord('F10'),
            getWord('F1'),
            getWord('F9'),
            getWord('F2'),
            getWord('F8'),
        ]);
    });
});
