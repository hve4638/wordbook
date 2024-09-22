import { ipcMain } from 'electron';
import ipcping from './ipcPing';

import { WordReference } from './services/dict';

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


function onIPC(callback) {
    try {
        return callback();
    }
    catch(error: unknown) {
        if (error instanceof Error) {
            return {
                name : error.name,
                message : error.message,
            }
        }
        else {
            return {
                name : 'Error',
                message : `${error}`,
            }
        }
    }
}

function initIPC() {
    ipcMain.handle(ipcping.ECHO, async (event, word)=>{
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
}

export {
    initIPC,
}