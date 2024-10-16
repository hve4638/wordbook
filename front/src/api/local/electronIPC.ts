import { IPCError } from './errors';

class ElectronIPC {
    static async openBrowser(url:string) {
        const [err] = await window.electron.openBrowser(url);
        if (err) throw new IPCError(err.message);
    }

    static async searchWord(word:string): Promise<WordMeaning[]|null> {
        const [err, data] = await window.electron.searchWord(word);
        if (err) throw new IPCError(err.message);
        
        return data;
    }
    
    static async getWord(word:string): Promise<WordData|null> {
        const [err, data] = await window.electron.getWord(word);
        if (err) {
            return null;
        }
        else {
            return data;
        }
    }

    static async addWord(wordData:WordData) {
        const [err] = await window.electron.addWord(wordData);
        if (err) throw new IPCError(err.message);
    }

    static async removeWord(word:string) {
        const [err] = await window.electron.removeWord(word);
        if (err) throw new IPCError(err.message);
    }

    static async getWords(
        conditions:WordSelectCondition[],
        option:WordSelectOption = {
            order: 'sequence'
        }
    ): Promise<WordData[]> {
        const [err, words] = await window.electron.getWords(conditions, option);
        if (err) throw new IPCError(err.message);

        console.log(words);
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