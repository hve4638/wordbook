import { InvalidQueryParameterError, QueryError } from '../errors';
import Sqlite3, { SqliteError } from 'better-sqlite3';

type DB = Sqlite3.Database;
type QueryParams = {[key:string]:any};

class Query<RowType = never> {
    private text:string;
    private queryParams:QueryParams;

    constructor(queryText:string, queryParams:QueryParams={}) {
        this.text = queryText;
        this.queryParams = queryParams;
    }

    get query() {
        return this.text;
    }

    get params() {
        return this.queryParams;
    }

    run(db:DB) {
        return this.handleDBError(
            ()=>db.prepare(this.query).run(this.params)
        );
    }
    exec(db:DB) {
        if (Object.keys(this.params).length > 0) {
            throw new InvalidQueryParameterError('Query parameter is not allowed');
        }
        return this.handleDBError(
            ()=>db.exec(this.query)
        );
    }
    all(db:DB):RowType[] {
        return this.handleDBError(
            ()=>db.prepare(this.query).all(this.params)
        );
    }
    get(db:DB):RowType|undefined {
        return this.handleDBError(
            ()=>db.prepare(this.query).get(this.params)
        );
    }

    private handleDBError(callback) {
        try {
            return callback();
        }
        catch(e:unknown) {
            if (e instanceof SqliteError) {
                throw new QueryError(e.message, this.query, this.params);
            }
            else {
                throw e;
            }
        }
    }
}


export default Query;