import { contextBridge, ipcRenderer } from 'electron';
import ipcping from '../ipcPing';

const api = {
    echo: (message:string) => ipcRenderer.invoke(ipcping.ECHO, message),
    searchWord: (word:string) => ipcRenderer.invoke(ipcping.SEARCH_WORD_ENKO, word),
};

contextBridge.exposeInMainWorld('electron', api);
