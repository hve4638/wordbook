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

    async editWord(word:string, meanings:WordMeaning[]) {
        const [err] = await window.electron.editWord(word, meanings);
        if (err) throw new IPCError(err.message);
    }

    async addBookmark(word:string) {
        const [err] = await window.electron.addBookmark(word);

        if (err) throw new IPCError(err.message);
    }
    
    async getBookmark(word:string): Promise<BookmarkData|null> {
        const [err, data] = await window.electron.getBookmark(word);
        if (err) return null;
        return data;
    }

    async getBookmarks(
        conditions:BookmarkSelectCondition[],
        option:WordSelectOption = {order: 'sequence'}
    ): Promise<BookmarkData[]> {
        const [err, bookmarks] = await window.electron.getBookmarks(conditions, option);
        if (err) throw new IPCError(err.message);
        
        return bookmarks;
    }

    async deleteBookmark(word:string) {
        const [err] = await window.electron.deleteBookmark(word);
        if (err) {
            throw new IPCError(err.message);
        }
    }

    async increaseBookmarkQuizScore(word:string, correct:number, incorrect:number) {
        const [err] = await window.electron.increaseBookmarkQuizScore(word, correct, incorrect);
        if (err) {
            throw new IPCError(err.message);
        }
    }
}

export default ElectronIPC;