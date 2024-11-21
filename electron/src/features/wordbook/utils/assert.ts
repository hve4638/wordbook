import { WordbookQueryBuildError } from '../errors';

export function assertBooleanOrNull(data:unknown, fieldName:string) {
    if (data == null) return;
    else if (typeof data === 'boolean') return;
    else throw new WordbookQueryBuildError(`Invalid field type '${fieldName}' : expected boolean , but ${typeof data}`);
}

export function assertNumberOrNull(data:unknown, fieldName:string) {
    if (data == null) return;
    else if (typeof data === 'number') return;
    else throw new WordbookQueryBuildError(`Invalid field type '${fieldName}' : expected number , but ${typeof data}`);
}