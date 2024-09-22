import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0;Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'

class wordreference {
    async search(word: string) {
        const response = await axios.get(`https://www.wordreference.com/enko/${word}`, {
            headers: { 'User-Agent': USER_AGENT },
        });
        
        return this.#parse(response.data);
    }

    #parse(html:string) {
        const result: { from: string; fromType: string; to: string; }[] = [];
        const $ = cheerio.load(html);
        const wrd = $('#articleWRD > .WRD');

        wrd.each((index, element) => {
            const tr = $(element).find('tr');
            const topsection = $(element).find('.wrtopsection').text();
            const isMain = topsection.includes('주요 번역');
            const isAdd = topsection.includes('추가 번역');
            
            if (!isMain && !isAdd) return;

            tr.each((index, element) => {
                const id = $(element).attr('id');
                if (!id?.startsWith('enko')) return;
            
                const word = $(element).find('.FrWrd > strong').text();
                const wordclass = $(element).find('.FrWrd > em').text();
                
                const toWrd = $(element).find('.ToWrd');
                const meanings:string[] = [];
                toWrd.contents().each((index, element) => {
                    if (element.type === 'text') {
                        meanings.push($(element).text().trim());
                    }
                });
                result.push({
                    from: word,
                    fromType: wordclass,
                    to: meanings.join('')
                });
            });
        });

        return result;
    }
}

export default wordreference;