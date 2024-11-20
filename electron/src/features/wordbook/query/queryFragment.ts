type QueryFragmentParams = {[key:string]:any};

class QueryFragment {
    #fragment: string;
    #params:QueryFragmentParams;
    
    constructor(query: string, params:QueryFragmentParams) {
        this.#fragment = query;
        this.#params = params;
    
    }

    get query() {
        return this.#fragment;
    }

    get params() {
        return this.#params;
    }
}

export default QueryFragment;