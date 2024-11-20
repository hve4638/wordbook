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

export class InvalidQueryParameterError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidQueryParameterError';
    }
}

export class QueryError extends Error {
    constructor(message:string, query:string, parameters:object) {
        let text = `${message}\n`;
        text += '\n<Query>\n';
        text += query.trim();
        text += '\n<Parameter>\n'
        for (const key in parameters) {
            text += `- ${key} : ${parameters[key]}\n`;
        }

        super(text);
        this.name = 'QueryError';
    }
}