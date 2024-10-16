export class WordbookError extends Error {
    constructor(message) {
        super(message);
        this.name = 'WordbookError';
    }
}

export class WordbookQueryBuildError extends Error {
    constructor(message) {
        super(message);
        this.name = 'WordbookQueryBuildError';
    }
}

