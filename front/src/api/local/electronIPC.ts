import { IPCError } from './errors';

class ElectronIPC {
    async openBrowser(url:string) {
        const [err] = await window.electron.openBrowser(url);
        if (err) throw new IPCError(err.message);
    }

    async searchWord(word:string): Promise<WordMeaning[]|null> {
        const [err, data] = await window.electron.searchWord(word);
        if (err) throw new IPCError(err.message);
        
        return data;
    }

    async addBookmark(word:string) {
        const [err] = await window.electron.addBookmark(word);
    }
    
    async getBookmark(word:string): Promise<BookmarkData|null> {
        const [err, data] = await window.electron.getBookmark(word);
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

    static async updateWordMeaningPriority(word:string, meaningIndexes:number[]) {
        const [err] = await window.electron.updateWordMeaningPriority(word, meaningIndexes);
        if (err) throw new IPCError(err.message);
    }
}

export default ElectronIPC;