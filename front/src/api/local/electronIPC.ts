import type { WordData, WordMeaning, WordSelectCondition } from 'types/words';
import { IPCError } from './errors';

class ElectronIPC {
    static async getWord(word:string): Promise<WordData|null> {
        const [err, data] = await window.electron.getWord(word);
        if (err) {
            return null;
        }
        else {
            return data;
        }
    }

    static async searchWord(word:string): Promise<WordMeaning[]|null> {
        const [err, data] = await window.electron.searchWord(word);
        if (err) throw new IPCError(err.message);
        
        return data;
    }

    static async addWord(wordData:WordData) {
        const [err, id] = await window.electron.addWord(wordData);
        if (err) throw new IPCError(err.message);
    }

    static async removeWord(word:string) {
        const [err] = await window.electron.removeWord(word);
        if (err) throw new IPCError(err.message);
    }

    static async getLatestWords(offset:number, limit:number): Promise<WordData[]> {
        const [err, data] = await window.electron.getLatestWords(offset, limit);
        if (err) throw new IPCError(err.message);
        
        return data;
    }

    static async getWords(offset:number, limit:number, condition:WordSelectCondition): Promise<WordData[]> {
        const [err, words] = await window.electron.getWords(offset, limit, condition);
        if (err) throw new IPCError(err.message);

        return words;
    }

    static async addWordScoreCorrect(word:string) {
        const [err] = await window.electron.addWordscoreCorrect(word)
        if (err) throw new IPCError(err.message);
    }

    static async addWordScoreIncorrect(word:string) {
        const [err] = await window.electron.addWordscoreIncorrect(word)
        if (err) throw new IPCError(err.message);
    }
}

export default ElectronIPC;