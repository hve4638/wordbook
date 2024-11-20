import * as fs from 'fs';
import * as path from 'path';
import { describe, test, expect, afterAll, beforeAll, afterEach, beforeEach } from '@jest/globals'
import Wordbook from './Wordbook';
import { WordbookError } from './errors';
import exp from 'constants';
import { Meaning } from './types/db';
import { SqliteError } from 'better-sqlite3';

describe('Wordbook', () => {
    let wordbook:Wordbook;

    const expectWordNotExists = (word) => {
        const actual = wordbook.getWord(word);
        expect(actual).toBeUndefined();
    }

    const expectWord = (word:string, meaning:Meaning[]) => {
        const actual = wordbook.getWord(word);
        expect(actual).toEqual({word, meaning});
    }

    const expectBookmarkNotExists = (word) => {
        const actual = wordbook.getBookmark(word);
        expect(actual).toBeUndefined();
    }

    const expectBookmarkExists = (word) => {
        const actual = wordbook.getBookmark(word);
        expect(actual).not.toBeUndefined();
    }

    beforeEach(() => {
        if (wordbook) {
            wordbook.drop();
        }
        wordbook = new Wordbook(':memory:');
    });

    test('add/get/remove word', ()=>{
        const word = 'apple';
        expectWordNotExists(word);

        const meaning = {from:'apple', to:'사과', fromType:'n'};
        wordbook.addWord(word, [meaning]);
        expectWord(word, [meaning]);

        wordbook.deleteWord(word);
        expectWordNotExists(word);
    })
    test('add/get/remove bookmark', ()=>{
        const word = 'apple';
        const meaning = {from:'apple', to:'사과', fromType:'n'};
        wordbook.addWord(word, [meaning]);
        expectBookmarkNotExists(word);
        
        wordbook.addBookmark(word);
        expectBookmarkExists(word);

        wordbook.deleteBookmark(word);
        expectBookmarkNotExists(word);
    });

    test('add word duplicate', ()=>{
        const word = 'apple';
        const meaning = {from:'apple', to:'사과', fromType:'n'};
        wordbook.addWord(word, [meaning]);
        expect(()=>wordbook.addWord(word, [meaning])).toThrow();
    });

    test('Remove Nonexistent', ()=>{
        wordbook.deleteWord('word');
    });
});