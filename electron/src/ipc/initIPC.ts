import { ipcMain } from 'electron';
import { getIPCHandler, IPCHandleDependencies } from './ipcHandler';
import ipcping from './ipcping';

type PINGS = typeof ipcping[keyof typeof ipcping];

export function initIPC(dependencies:IPCHandleDependencies) {    
    const handlers = getIPCHandler(dependencies);
    
    handleIPC(ipcping.ECHO_SYNC, handlers.echoSync);
    handleIPC(ipcping.OPEN_BROWSER, handlers.openBrowser);
    handleIPC(ipcping.SEARCH_WORD_ENKO, handlers.searchWord);
    handleIPC(ipcping.ADD_BOOKMARK, handlers.addBookmark);
    handleIPC(ipcping.GET_BOOKMARK, handlers.getBookmark);
    handleIPC(ipcping.GET_BOOKMARKS, handlers.getBookmarks);
    handleIPC(ipcping.DELETE_BOOKMARK, handlers.deleteBookmark);
    handleIPC(ipcping.INCREASE_BOOKMARK_QUIZSCORE, handlers.increaseBookmarkQuizScore);
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