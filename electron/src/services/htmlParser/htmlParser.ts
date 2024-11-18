import * as cheerio from 'cheerio';

export class HTMLParser {
    #html: string;
    #api: cheerio.CheerioAPI;

    constructor(html:string) {
        this.#html = html;
        this.#api = cheerio.load(html);
    }

    select(selector: string) {
        return new HtmlNode(this.#api, this.#api(selector));
    }

    root() {
        return new HtmlNode(this.#api, this.#api.root());
    }

    get html() {
        return this.#api.html();
    }
}

class HtmlNode {
    #api: cheerio.CheerioAPI;
    #element;

    constructor(api: cheerio.CheerioAPI, element) {
        this.#api = api;
        this.#element = element;
    }

    select(selector: string) {
        const result = this.#api(selector);

        return new HtmlNode(this.#api, this.#api(selector));
    }

    selectAll(selector: string) {

    }

    children() {
        return this.#element.children();
    }

    get text() {
        return this.#element.text();
    }

    get html():string {
        console.log(this.#element);
        return this.#element.html() ?? '';
    }

    get attr() {
        return this.#element.attr;
    }

    each(callback: (index: number, element: any) => void) {
        this.#element.each(callback);
    }

    contents() {
        return this.#element.contents();
    }
}