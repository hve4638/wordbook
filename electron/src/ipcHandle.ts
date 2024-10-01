import { ipcMain } from 'electron';
import ipcping from './ipcPing';

import { WordReference } from './services/dict';
import Wordbook from './wordbook';
import type { WordSelectCondition } from './wordbook/types';

type WordData = {
    id:number,
    word:string,
    data:object
}

const wordReference = new WordReference();

function makeError(error) {
    try {
        return {
            name : error.name,
            message : error.message,
        }
    }
    catch(error: unknown) {
        return {
            name : 'UnknownError',
            message : 'Unknown error',
        }
    }
}

interface initIPCArgs {
    wordbookDB: Wordbook;
}

function initIPC({wordbookDB}:initIPCArgs) {
    ipcMain.handle(ipcping.ECHO_SYNC, (event, word:string)=>{
        return [null, word];
    });

    ipcMain.handle(ipcping.SEARCH_WORD_ENKO, async (event, word:string) => {
        try {
            return [null, await wordReference.search(word)];
        }
        catch(error: unknown) {
            return [makeError(error), null];
        }
    });
    /**
     * electron.addWord 핸들러
     */
    ipcMain.handle(ipcping.ADD_WORD, async (event, wordData:WordData) => {
        try {
            wordbookDB.addWord(wordData.word, wordData.data);
            return [null, null];
        }
        catch(error: unknown) {
            return [makeError(error), null];
        }
    });
    /**
     * electron.removeWord 핸들러
     */
    ipcMain.handle(ipcping.REMOVE_WORD, async (event, word:string) => {
        try {
            return [null, wordbookDB.removeWord(word)];
        }
        catch(error: unknown) {
            return [makeError(error), null];
        }
    });
    /**
     * electron.getWord 핸들러
     */
    ipcMain.handle(ipcping.GET_WORD, async (event, word:string) => {
        try {
            const data = wordbookDB.get(word);
            if (data) {
                return [null, data];
            }
            else {
                throw new Error('No word found');
            }
        }
        catch(error: unknown) {
            return [makeError(error), null];
        }
    });
    /**
     * electron.getWords 핸들러
     */
    ipcMain.handle(ipcping.GET_WORDS, async (event, offset:number, limit:number, condition:WordSelectCondition) => {
        try {
            return [null, wordbookDB.getWords(offset, limit, condition)];
        }
        catch(error: unknown) {
            return [makeError(error), null];
        }
    });
    ipcMain.handle(ipcping.GET_LATEST_WORDS, async (event, offset:number, limit:number) => {
        try {
            return [null, wordbookDB.getLatest(offset, limit)];
        }
        catch(error: unknown) {
            return [makeError(error), null];
        }
    });
    ipcMain.handle(ipcping.ADD_WORDSCORE_CORRECT, async (event, wordName:string) => {
        try {
            wordbookDB.addWordscoreCorrect(wordName);
            return [null];
        }
        catch(error: unknown) {
            return [makeError(error)];
        }
    });
    ipcMain.handle(ipcping.ADD_WORDSCORE_INCORRECT, async (event, wordName:string) => {
        try {
            wordbookDB.addWordscoreIncorrect(wordName);
            return [null];
        }
        catch(error: unknown) {
            return [makeError(error)];
        }
    });
}

export {
    initIPC,
}