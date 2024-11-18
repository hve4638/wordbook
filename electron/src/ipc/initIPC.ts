import { ipcMain } from 'electron';
import { getIPCHandler, IPCHandleDependencies } from './ipcHandler';
import ipcping from './ipcping';

type PINGS = typeof ipcping[keyof typeof ipcping];

export function initIPC(dependencies:IPCHandleDependencies) {    
    const handlers = getIPCHandler(dependencies);
    
    handleIPC(ipcping.ECHO_SYNC, handlers.echoSync);
    handleIPC(ipcping.OPEN_BROWSER, handlers.openBrowser);
    handleIPC(ipcping.SEARCH_WORD_ENKO, handlers.searchWord);
    handleIPC(ipcping.ADD_WORD, handlers.addWord);
    handleIPC(ipcping.REMOVE_WORD, handlers.removeWord);
    handleIPC(ipcping.UPDATE_WORD_MEANING_PRIORITY, handlers.updateWordMeaningPriority);
    handleIPC(ipcping.GET_WORD, handlers.getWord);
    handleIPC(ipcping.GET_WORDS, handlers.getWords);
    handleIPC(ipcping.ADD_WORDSCORE_CORRECT, handlers.addWordscoreCorrect);
    handleIPC(ipcping.ADD_WORDSCORE_INCORRECT, handlers.addWordscoreIncorrect);
}

function handleIPC(ping:PINGS, callback:any) {
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