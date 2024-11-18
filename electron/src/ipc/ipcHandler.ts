import fs from 'fs';
import { ipcMain, shell } from 'electron';
import ipcping from './ipcping';
import { WordReference } from '../services/dict';
import Wordbook from '../wordbook';

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
        searchWord: async (word:string) => {
            return [null, await wordReference.search(word)];
        },
        openBrowser: async (url:string) => {
            if (!url.startsWith('https://')) {
                url = 'https://' + url;
            }
            shell.openExternal(url);
            return [null];
        },

        addWord: async (wordData:WordData) => {
            wordbook.addWord(wordData.word, wordData.data);
            return [null, -1];
        },
        removeWord: async (word:string) => {
            wordbook.removeWord(word);
            return [null];
        },

        getWord: async (word:string) => {
            const data = wordbook.getWord(word);
            if (data) {
                return [null, data];
            }
            else {
                throw new Error('No word found');
            }
        },
        getWords: async (conditions:WordSelectCondition[], option:WordSelectOption) => {
            return [null, wordbook.getWords(conditions)];
        },
        updateWordMeaningPriority: async (word:string, meaningIndexes:number[]) => {
            wordbook.updateWordMeaningPriority(word, meaningIndexes);
            return [null];
        },

        addWordscoreCorrect: async (word:string) => {
            wordbook.addWordCorrectCount(word);
            return [null];
        },
        addWordscoreIncorrect: async (word:string) => {
            wordbook.addWordIncorrectCount(word);
            return [null];
        },
    }
}
