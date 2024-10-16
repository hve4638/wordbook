import { ipcMain } from 'electron';
import { getIPCHandler, IPCHandleDependencies } from './ipcHandler';
import ipcping from './ipcping';

type PINGS = typeof ipcping[keyof typeof ipcping];

export function initIPC(dependencies:IPCHandleDependencies) {    
    const handlers = getIPCHandler(dependencies);
    
    ipcHandle(ipcping.ECHO_SYNC, handlers.echoSync);
    ipcHandle(ipcping.OPEN_BROWSER, handlers.openBrowser);
    ipcHandle(ipcping.SEARCH_WORD_ENKO, handlers.searchWord);
    ipcHandle(ipcping.ADD_WORD, handlers.addWord);
    ipcHandle(ipcping.REMOVE_WORD, handlers.removeWord);
    ipcHandle(ipcping.GET_WORD, handlers.getWord);
    ipcHandle(ipcping.GET_WORDS, handlers.getWords);
    ipcHandle(ipcping.ADD_WORDSCORE_CORRECT, handlers.addWordscoreCorrect);
    ipcHandle(ipcping.ADD_WORDSCORE_INCORRECT, handlers.addWordscoreIncorrect);
}

function ipcHandle(ping:PINGS, callback:any) {
    ipcMain.handle(ping, async (event: any, ...args: any) => {
        try {
            const result = await callback(...args);
            return result;
        }
        catch (error:any) {
            return [makeErrorStruct(error)];
        }
    });
}

function makeErrorStruct(error:any) {
    try {
        return {
            name : error.name,
            message : error.message,
        }
    }
    catch(error) {
        return {
            name : 'UnknownError',
            message : 'Unknown error',
        }
    }
}