import { WordbookQueryBuildError } from "./errors";

const ORDER ={
    HIGH : 'DESC',
    LOW : 'ASC',
} as const;
type ORDER = typeof ORDER[keyof typeof ORDER];


function assertBooleanOrNull(data:unknown, fieldName:string) {
    if (data == null) return;
    else if (typeof data === 'boolean') return;
    else throw new WordbookQueryBuildError(`Invalid field type '${fieldName}' : expected boolean , but ${typeof data}`);
}

function assertNumberOrNull(data:unknown, fieldName:string) {
    if (data == null) return;
    else if (typeof data === 'number') return;
    else throw new WordbookQueryBuildError(`Invalid field type '${fieldName}' : expected number , but ${typeof data}`);
}

class WordbookQueryBuilder {
    #validateWordSelectCondition(condition:WordSelectCondition) {
        assertBooleanOrNull(condition.lowQuizFrequency, 'lowQuizFrequency');
        assertBooleanOrNull(condition.highQuizFrequency, 'highQuizFrequency');
        assertBooleanOrNull(condition.lowQuizIncorrect, 'lowQuizIncorrect');
        assertBooleanOrNull(condition.highQuizIncorrect, 'highQuizIncorrect');
        assertNumberOrNull(condition.lowIncorrectRateLimit, 'lowIncorrectRateLimit');
        assertNumberOrNull(condition.highIncorrectRateLimit, 'highIncorrectRateLimit');
        assertNumberOrNull(condition.lowFrequencyLimit, 'lowFrequencyLimit');
        assertNumberOrNull(condition.highFrequencyLimit, 'highFrequencyLimit');
        assertNumberOrNull(condition.offset, 'offset');
        assertNumberOrNull(condition.limit, 'limit');
        assertBooleanOrNull(condition.oldest, 'oldest');
        assertBooleanOrNull(condition.latest, 'latest');

        // 서로 대립되는 조건이 있다면 예외 발생
        if (condition.highQuizFrequency && condition.lowQuizFrequency) {
            throw new WordbookQueryBuildError('highQuizFrequency and lowQuizFrequency are mutually exclusive');
        }
        if (condition.highQuizIncorrect && condition.lowQuizIncorrect) {
            throw new WordbookQueryBuildError('highQuizIncorrect and lowQuizIncorrect are mutually exclusive');
        }
        if (condition.oldest && condition.latest) {
            throw new WordbookQueryBuildError('oldest and latest are mutually exclusive');
        }
    }

    createTableWordbookQuery():string {
        return `
            CREATE TABLE IF NOT EXISTS Wordbook (
                id INTEGER PRIMARY KEY,
                word TEXT NOT NULL UNIQUE,
                data TEXT NOT NULL,
                added_date INTEGER NOT NULL
            );
        `;
    }
    createTableQuizScoreQuery():string {
        return `
            CREATE TABLE IF NOT EXISTS QuizScore (
                word TEXT PRIMARY KEY,
                total INTEGER NOT NULL DEFAULT 0,
                correct INTEGER NOT NULL DEFAULT 0,
                incorrect INTEGER NOT NULL DEFAULT 0
            );
        `;
    }
    createViewWordbookQuery():string {
        return `
            CREATE VIEW IF NOT EXISTS view_Wordbook
            AS SELECT   
                Wordbook.id,
                Wordbook.word,
                Wordbook.data,
                Wordbook.added_date,
                QuizScore.total,
                QuizScore.correct,
                QuizScore.incorrect,
                CASE
                    WHEN QuizScore.total = 0 THEN 0
                    ELSE 100.0 * QuizScore.incorrect / QuizScore.total
                END as incorrect_rate
            FROM Wordbook
            JOIN QuizScore ON Wordbook.word = QuizScore.word;
        `;
    }

    selectWordsQuery(condition:WordSelectCondition, queryNumber?:number):string {
        this.#validateWordSelectCondition(condition);

        const whereCondition:string[] = this.#getWhereCondition(condition);
        const orderBy:string[] = this.#getOrderBy(condition);

        const offset = condition.offset;
        const limit = condition.limit;

        return `
            SELECT
                *
            ${
                queryNumber != null
                ? `, ${queryNumber} as query_number`
                : ''
            }
            FROM view_Wordbook
            ${
                whereCondition.length > 0
                ? `WHERE ${whereCondition.join(' AND ')}`
                : ''
            }
            ${
                orderBy.length > 0
                ? `ORDER BY ${orderBy.join(', ')}`
                : ''
            }
            ${
                limit
                ? `LIMIT ${limit}`
                : ''
            }
            ${
                offset
                ? `OFFSET ${offset}`
                : ''
            }
        `;
    }

    selectWordCountQuery(condition:WordSelectCondition):string {
        this.#validateWordSelectCondition(condition);

        const whereCondition:string[] = this.#getWhereCondition(condition);
        const offset = condition.offset;
        const limit = condition.limit;

        return `
            SELECT count(*)
            FROM view_Wordbook
            ${
                whereCondition.length > 0
                ? `WHERE ${whereCondition.join(' AND ')}`
                : ''
            }
            ${
                limit
                ? `LIMIT ${limit}`
                : ''
            }
            ${
                offset
                ? `OFFSET ${offset}`
                : ''
            }
        `;
    }

    #getWhereCondition(condition:WordSelectCondition):string[] {
        const whereCondition:string[] = []; 
        if (condition.lowIncorrectRateLimit) {
            whereCondition.push(`incorrect_rate >= ${condition.lowIncorrectRateLimit}`);
        }
        if (condition.highIncorrectRateLimit) {
            whereCondition.push(`incorrect_rate <= ${condition.highIncorrectRateLimit}`);
        }
        if (condition.lowFrequencyLimit) {
            whereCondition.push(`total >= ${condition.lowFrequencyLimit}`);
        }
        if (condition.highFrequencyLimit) {
            whereCondition.push(`total <= ${condition.highFrequencyLimit}`);
        }

        return whereCondition;
    }

    #getOrderBy(condition:WordSelectCondition):string[] {
        /*
            ORDER BY 순서
            incorrect_rate
            total
            incorrect
            added_date
        */
        let totalOrder:ORDER|undefined;
        if (condition.highQuizFrequency) totalOrder = ORDER.HIGH;
        else if (condition.lowQuizFrequency) totalOrder = ORDER.LOW;

        let incorrectOrder:ORDER|undefined;
        if (condition.highQuizIncorrect) incorrectOrder = ORDER.HIGH;
        else if (condition.lowQuizIncorrect) incorrectOrder = ORDER.LOW;

        const orderBy:string[] = [];
        if (incorrectOrder) orderBy.push(`incorrect_rate ${incorrectOrder}`);
        if (totalOrder) orderBy.push(`total ${totalOrder}`);
        if (incorrectOrder) orderBy.push(`incorrect ${incorrectOrder}`);

        if (condition.oldest) {
            orderBy.push(`added_date ${ORDER.LOW}`);
            orderBy.push(`id ${ORDER.LOW}`);
        }
        else if (condition.latest) {
            orderBy.push(`added_date ${ORDER.HIGH}`);
            orderBy.push(`id ${ORDER.HIGH}`);
        }
        else {
            orderBy.push(`id ${ORDER.HIGH}`);
        }

        return orderBy;
    }

    selectFromSubquery(subqueries:string[]):string {
        const selects = subqueries.map(subquery => `SELECT * FROM (${subquery})`);
        const query = selects.join('\nUNION ALL\n')

        return query;
    }

    selectCountFromSubquery(subqueries:string[]):string {
        const query = `
            SELECT count(*)
            FROM (
                ${subqueries.join('\nUNION\n')}
            )
        `;

        return query;
    }
}

export default WordbookQueryBuilder;