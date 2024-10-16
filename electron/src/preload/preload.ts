import { contextBridge, ipcRenderer } from 'electron';
import { ipcping } from '../ipc';

const api:IPC_APIS = {
    echoSync: (message:string) => ipcRenderer.invoke(ipcping.ECHO_SYNC, message),
    searchWord: (word:string) => ipcRenderer.invoke(ipcping.SEARCH_WORD_ENKO, word),
    openBrowser: (url:string) => ipcRenderer.invoke(ipcping.OPEN_BROWSER, url),

    addWord: (wordData:WordData) => ipcRenderer.invoke(ipcping.ADD_WORD, wordData),
    removeWord: (word:string) => ipcRenderer.invoke(ipcping.REMOVE_WORD, word),
    getWord: (word:string) => ipcRenderer.invoke(ipcping.GET_WORD, word),
    getWords: (conditions:WordSelectCondition[], option:WordSelectOption) => ipcRenderer.invoke(ipcping.GET_WORDS, conditions, option),

    addWordscoreCorrect: (word:string) => ipcRenderer.invoke(ipcping.ADD_WORDSCORE_CORRECT, word),
    addWordscoreIncorrect: (word:string) => ipcRenderer.invoke(ipcping.ADD_WORDSCORE_INCORRECT, word),
    

    onVisible: (listener:(event)=>void) => ipcRenderer.on(ipcping.ON_VISIBLE, listener),
    onHide: (listener:(event)=>void) => ipcRenderer.on(ipcping.ON_HIDE, listener),
    onReceiveClipboard: (listener:(event, clipboard:string, force:boolean)=>void) => ipcRenderer.on(ipcping.ON_RECEIVE_CLIPBOARD, listener),
};

contextBridge.exposeInMainWorld('electron', api);
