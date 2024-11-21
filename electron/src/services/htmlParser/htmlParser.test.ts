import { describe, test, expect, afterAll, beforeAll, afterEach, beforeEach } from '@jest/globals'
import { HTMLParser } from './htmlParser'

const htmlTemplate = `
<html>
<head>
</head>
<body>
    <div id="header">
        <h1>Header</h1>
    </div>
    <main class="content">
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div>6</div>
    </main>
    <div id="sidebar">
    
    </div>
</body>
</html>
`


describe('Html Parser', () => {
    const expectHTML = (actual?:string, expected?:string) => {
        expect(
            actual?.replace(/\s/g, '')
        ).toBe(
            expected?.replace(/\s/g, '')
        );
    }

    test('load html', () => {
        const parser = new HTMLParser(htmlTemplate);

        expectHTML(parser.html, htmlTemplate);
    })

    test('select', () => {
        const parser = new HTMLParser(htmlTemplate);

        const expected = `
            <div id="sidebar">
            </div>
        `;
        expectHTML(parser.select('#sidebar')[0].html, expected);
    })
});