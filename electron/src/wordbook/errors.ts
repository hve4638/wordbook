export class WordbookError extends Error {
    constructor(message) {
        super(message);
        this.name = 'WordbookError';
    }
}