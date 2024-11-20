import {SqliteError} from 'better-sqlite3';
import {WordbookError} from '../errors';

/**
 * DB 에러를 처리
 * 
 * SqliteError를 WordbookError로 변환하고, 그 외 에러는 그대로 던진다.
 */
export function handleDBError(e:unknown):void {
    if (e instanceof Error) {
        if (e instanceof SqliteError) {
            throw new WordbookError(`Query Failed : ${e.message}`);
        }
        else {
            throw e;
        }
    }
    else {
        throw new Error(`Unknown error : ${e}`);
    }
}