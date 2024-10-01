import * as fs from 'node:fs';
import * as path from 'node:path';
import Database from 'better-sqlite3';
import {SqliteError} from 'better-sqlite3';
import {WordbookError} from './errors';
import { WordSelectCondition } from './types';

type WordData = {
    id:number,
    word:string,
    data:string
}

type Score = {
    total:number,
    correct:number,
    incorrect:number
}

class Wordbook {
    #path:string;
    #db:Database;

    constructor(target:string) {
        this.#path = target;
        try {
            this.#db = new Database(this.#path);
        }
        catch(e:any) {
            throw new Error(`Failed to open database '${path}' : ${e.message}`);
        }
        
        this.#db.exec(`
            CREATE TABLE IF NOT EXISTS Wordbook (
                id INTEGER PRIMARY KEY,
                word TEXT NOT NULL UNIQUE,
                data TEXT NOT NULL,
                added_date INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS QuizScore (
                word TEXT PRIMARY KEY,
                total INTEGER NOT NULL DEFAULT 0,
                correct INTEGER NOT NULL DEFAULT 0,
                incorrect INTEGER NOT NULL DEFAULT 0
            );
        `);
    }

    /**
     * 단어 추가, 이미 단어가 존재한다면 WordbookError 발생
     * @param word
     * @param data
     */
    addWord(word:string, data:object) {
        const transaction = this.#db.transaction(() => {
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const jsonData = JSON.stringify(data);
            const queryWordbook = this.#db.prepare(
                'INSERT INTO Wordbook(word, data, added_date) VALUES($word, $data, $currentTimestamp)'
            );
            const queryWordQuiz = this.#db.prepare(
                'INSERT INTO QuizScore(word) VALUES($word)'
            );
            queryWordbook.run({word, data:jsonData, currentTimestamp});
            queryWordQuiz.run({word});
        });
        
        try {
            transaction();
        }
        catch(e) {
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
    }

    /**
     * 단어 제거, 단어가 존재하지 않으면 아무것도 하지 않음
     * @param word 
     */
    removeWord(word:string) {
        const transaction = this.#db.transaction(() => {
            const queryWordbook = this.#db.prepare(
                'DELETE FROM Wordbook WHERE word = $word'
            );
            const queryWordQuiz = this.#db.prepare(
                'DELETE FROM QuizScore WHERE word = $word'
            );
            queryWordbook.run({word});
            queryWordQuiz.run({word});
        });

        transaction();
    }

    get(word:string):WordData|undefined {
        const select = this.#db.prepare(
            "SELECT * FROM Wordbook WHERE word = $word LIMIT 1"
        );
        const result = select.all({word});
        if (result.length === 0) {
            return undefined;
        }
        else {
            return result[0];
        }
    }
    
    getLatest(offset=0, limit=1000):WordData[] {
        const select = this.#db.prepare(
            'SELECT * FROM Wordbook ORDER BY added_date DESC LIMIT $limit OFFSET $offset'
        );
        const data = select.all({offset, limit});

        this.#parsedWordDataMeaning(data);
        return data;
    }

    getOldest(offset=0, limit=1000):WordData[] {
        const select = this.#db.prepare(
            'SELECT * FROM Wordbook ORDER BY id ASC LIMIT $limit OFFSET $offset'
        );
        return select.all({offset, limit});
    }

    resetScore(word:string) {
        const query = this.#db.prepare(
            'UPDATE QuizScore SET total = 0, correct = 0, incorrect = 0 WHERE word = $word'
        );
        query.run({word});
    }
    
    addWordscoreCorrect(word:string) {
        const query = this.#db.prepare(
            'UPDATE QuizScore SET total = total + 1, correct = correct + 1 WHERE word = $word'
        );
        query.run({word});
    }

    addWordscoreIncorrect(word:string) {
        const query = this.#db.prepare(
            'UPDATE QuizScore SET total = total + 1, incorrect = incorrect + 1 WHERE word = $word'
        );
        query.run({word});
    }

    getMoreIncorrect(offset=0, limit=1000):WordData[] {
        const select = this.#db.prepare(
            `
            SELECT id, Wordbook.word, data
            FROM Wordbook
            JOIN QuizScore
            ON Wordbook.word = QuizScore.word
            ORDER BY QuizScore.incorrect DESC
            LIMIT $limit OFFSET $offset
            `
        );
        return select.all({offset, limit});
    }

    getLessIncorrect(offset=0, limit=1000):WordData[] {
        const select = this.#db.prepare(
            `
            SELECT id, Wordbook.word, data
            FROM Wordbook
            JOIN QuizScore
            ON Wordbook.word = QuizScore.word
            ORDER BY QuizScore.incorrect ASC
            LIMIT $limit OFFSET $offset
            `
        );
        return select.all({offset, limit});
    }

    getMoreFrequency(offset=0, limit=1000):WordData[] {
        const select = this.#db.prepare(
            `
            SELECT id, Wordbook.word, data
            FROM Wordbook
            JOIN QuizScore
            ON Wordbook.word = QuizScore.word
            ORDER BY QuizScore.total DESC
            LIMIT $limit OFFSET $offset
            `
        );
        return select.all({offset, limit});
    }

    getLessFrequency(offset=0, limit=1000):WordData[] {
        const select = this.#db.prepare(
            `
            SELECT id, Wordbook.word, data
            FROM Wordbook
            JOIN QuizScore
            ON Wordbook.word = QuizScore.word
            ORDER BY QuizScore.total ASC
            LIMIT $limit OFFSET $offset
            `
        );
        return select.all({offset, limit});
    }

    getWords(offset=0, limit=0, condition:WordSelectCondition):WordData[] {
        let totalOrder:string;
        if (condition.moreQuizFrequency) totalOrder = 'DESC';
        else if (condition.lessQuizFrequency) totalOrder = 'ASC';
        else totalOrder = 'ASC';

        let incorrectOrder:string;
        if (condition.moreQuizIncorrect) incorrectOrder = 'DESC';
        else if (condition.lessQuizIncorrect) incorrectOrder = 'ASC';
        else incorrectOrder = 'ASC';

        const query = `
            SELECT id, Wordbook.word, data
            FROM Wordbook
            JOIN QuizScore
            ON Wordbook.word = QuizScore.word
            ORDER BY QuizScore.incorrect ${totalOrder}, QuizScore.total ${incorrectOrder}
            LIMIT $limit OFFSET $offset
        `;

        const select = this.#db.prepare(query);
        const data = select.all({
            offset,
            limit
        }) as WordData[];

        if (condition.shuffle) {
            this.#shuffle(data);
        }

        this.#parsedWordDataMeaning(data);

        return data;
    }

    #shuffle(data:any[]) {
        for (let i = data.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            
            [data[i], data[j]] = [data[j], data[i]];
        }
    }

    #parsedWordDataMeaning(target:WordData[]) {
        for (const data of target) {
            data.data = JSON.parse(data.data);
        }
    }

    getScore(word:string):Score|undefined {
        const query = this.#db.prepare(
            'SELECT total, correct, incorrect FROM QuizScore WHERE word = $word'
        );

        const result = query.all({word});
        if (result.length === 0) {
            return undefined;
        }
        else {
            return result[0];
        }
    }

    clear() {
        const queryWordbook = this.#db.prepare(
            'DELETE FROM Wordbook'
        );
        const queryWordQuiz = this.#db.prepare(
            'DELETE FROM QuizScore'
        );
        queryWordbook.run();
        queryWordQuiz.run();
    }

    drop() {
        this.close();

        if (fs.existsSync(this.#path)) {
            fs.unlinkSync(this.#path);
        }
    }

    close() {
        if (this.#db) {
            this.#db.close();
            this.#db = null;
        }
    }
}


export default Wordbook;