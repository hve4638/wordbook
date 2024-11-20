import { contextBridge, ipcRenderer } from 'electron';
import { ipcping } from '../ipc';

const api:IPC_APIS = {
    echoSync: (message:string) => ipcRenderer.invoke(ipcping.ECHO_SYNC, message),
    openBrowser: (url:string) => ipcRenderer.invoke(ipcping.OPEN_BROWSER, url),
    searchWord: (word:string) => ipcRenderer.invoke(ipcping.SEARCH_WORD_ENKO, word),
    editWord: (word:string, meaning:WordMeaning[]) => ipcRenderer.invoke(ipcping.EDIT_WORD, word, meaning),
    
    addBookmark: (wordData:WordData) => ipcRenderer.invoke(ipcping.ADD_BOOKMARK, wordData),
    getBookmark: (word:string) => ipcRenderer.invoke(ipcping.GET_BOOKMARK, word),
    getBookmarks: (conditions:BookmarkSelectCondition[], option:WordSelectOption) => ipcRenderer.invoke(ipcping.GET_BOOKMARKS, conditions, option),
    deleteBookmark: (word:string) => ipcRenderer.invoke(ipcping.DELETE_BOOKMARK, word),
    increaseBookmarkQuizScore: (word:string, correct:number, incorrect:number) => ipcRenderer.invoke(ipcping.INCREASE_BOOKMARK_QUIZSCORE, word, correct, incorrect),

    onVisible: (listener:(event)=>void) => ipcRenderer.on(ipcping.ON_VISIBLE, listener),
    onHide: (listener:(event)=>void) => ipcRenderer.on(ipcping.ON_HIDE, listener),
    onReceiveClipboard: (listener:(event, clipboard:string, force:boolean)=>void) => ipcRenderer.on(ipcping.ON_RECEIVE_CLIPBOARD, listener),
};

contextBridge.exposeInMainWorld('electron', api);
