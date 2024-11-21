import fs from 'fs';
import { ipcMain, shell } from 'electron';
import ipcping from './ipcping';
import { WordReference } from '../services/dict';
import Wordbook from '../features/wordbook';

export interface IPCHandleDependencies {
    wordbook:Wordbook,
    wordReference:WordReference,
}

type IPC_APIS_OMMITED = 'onVisible'|'onHide'|'onReceiveClipboard';

/**
 * IPC API Handler 함수 반환
 */
export function getIPCHandler({
    wordbook,
    wordReference
}:IPCHandleDependencies):Omit<IPC_APIS, IPC_APIS_OMMITED> {
    return {
        echoSync: async (message:string) => {
            return [null, message];
        },
        openBrowser: async (url:string) => {
            if (!url.startsWith('https://')) {
                url = 'https://' + url;
            }
            shell.openExternal(url);
            return [null];
        },
        searchWord: async (word:string) => {
            const cached = wordbook.getWord(word);
            if (cached) {
                return [null, cached.meanings];
            }
            else {
                const meanings = await wordReference.search(word);
                wordbook.addWord(word, meanings);

                return [null, meanings];
            }
        },
        editWord: async (word:string, meanings:WordMeaning[]) => {
            wordbook.editWord(word, meanings);
            return [null];
        },

        addBookmark: async (word:string) => {
            wordbook.addBookmark(word);
            return [null, -1];
        },
        getBookmark: async (word:string) => {
            const data = wordbook.getBookmark(word);
            if (data) {
                return [null, data];
            }
            else {
                throw new Error('No word found');
            }
        },
        getBookmarks: async (conditions:BookmarkSelectCondition[], option:WordSelectOption) => {
            return [null, wordbook.getBookmarks(conditions)]; 
        },
        deleteBookmark: async (word:string) => {
            wordbook.deleteBookmark(word);
            return [null];
        },

        increaseBookmarkQuizScore: async (word:string, correct:number, incorrect:number) => {
            wordbook.increaseBookmarkQuizScore(word, correct, incorrect);
            return [null];
        },
    }
}
