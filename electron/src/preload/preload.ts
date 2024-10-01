import { contextBridge, ipcRenderer } from 'electron';
import ipcping from '../ipcPing';

type WordData = {
    id: number,
    word: string,
    data: object,
}

type WordSelectCondition = {
    lessQuizFrequency?: boolean;
    moreQuizFrequency?: boolean;

    lessQuizIncorrect?: boolean;
    moreQuizIncorrect?: boolean;
}

const api = {
    echoSync: (message:string) => ipcRenderer.invoke(ipcping.ECHO_SYNC, message),
    searchWord: (word:string) => ipcRenderer.invoke(ipcping.SEARCH_WORD_ENKO, word),

    addWord: (wordData:WordData) => ipcRenderer.invoke(ipcping.ADD_WORD, wordData),
    removeWord: (word:string) => ipcRenderer.invoke(ipcping.REMOVE_WORD, word),
    getWord: (word:string) => ipcRenderer.invoke(ipcping.GET_WORD, word),
    getWords: (offset:number, limit:number, condition:WordSelectCondition) => ipcRenderer.invoke(ipcping.GET_WORDS, offset, limit, condition),

    getLatestWords: (offset:number, limit:number) => ipcRenderer.invoke(ipcping.GET_LATEST_WORDS, offset, limit),
    addWordscoreCorrect: (word:string) => ipcRenderer.invoke(ipcping.ADD_WORDSCORE_CORRECT, word),
    addWordscoreIncorrect: (word:string) => ipcRenderer.invoke(ipcping.ADD_WORDSCORE_INCORRECT, word),
    

    onVisible: (listener:(event)=>void) => ipcRenderer.on(ipcping.ON_VISIBLE, listener),
    onHide: (listener:(event)=>void) => ipcRenderer.on(ipcping.ON_HIDE, listener),
    onReceiveClipboard: (listener:(event, clipboard:string)=>void) => ipcRenderer.on(ipcping.ON_RECEIVE_CLIPBOARD, listener),
};

contextBridge.exposeInMainWorld('electron', api);
