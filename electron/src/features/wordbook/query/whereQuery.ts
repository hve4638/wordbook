import type { QueryParams } from './types';

class WhereQuery {
    #conditions:string[] = [];
    #params:QueryParams = {};
    #query:string|null = null;
    
    add(query:string, params:QueryParams={}) {
        this.#conditions.push(query);
        this.#params = {...this.#params, ...params};
        this.#query = null;
    }

    get query() {
        if (this.#query === null) {
            if (this.#conditions.length === 0) {
                this.#query = '';
            }
            else {
                this.#query = `WHERE ${this.#conditions.join(' AND ')}`;
            }
        }
        
        return this.#query;
    }

    get params() {
        return this.#params;
    }
}

export default WhereQuery;