import { ORDER } from '../types';
import type { QueryParams } from './types';

class OrderByQuery {
    #conditions:string[] = [];
    #params:QueryParams = {};
    #query:string|null = null;
    
    add(query:string, order:ORDER) {
        this.#conditions.push(`${query} ${order}`);
        this.#query = '';
    }

    get query() {
        if (this.#query === null) {
            if (this.#conditions.length === 0) {
                this.#query = '';
            }
            else {
                this.#query ??= `ORDER BY ${this.#conditions.join(' AND ')}`;
            }
        }
        return this.#query;
    }

    get params() {
        return {};
    }
}

export default OrderByQuery;