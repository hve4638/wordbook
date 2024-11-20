import { WordbookQueryBuildError } from './errors';
import { assertBooleanOrNull, assertNumberOrNull } from './utils';
import { OrderByQuery, Query, QueryFragment, WhereQuery } from './query';
import { ORDER } from './types';
import { DBBookmarkView, RawDBBookmarkView, RawDBWord } from './types/db';

class WordbookQueryBuilder {
    // DDL
    createTablesAndViews():Query[] {
        return [
            this.createWordsTable(),
            this.createBookmarkTable(),
            this.createBookmarkQuizTable(),
            this.createBookmarkView()
        ];
    }
    createWordsTable():Query {
        return new Query(`
            CREATE TABLE IF NOT EXISTS Words (
                word TEXT PRIMARY KEY,
                meaning TEXT NOT NULL DEFAULT '[]'
            );
        `);
    }
    createBookmarkTable():Query {
        return new Query(`
            CREATE TABLE IF NOT EXISTS Bookmark (
                id INTEGER PRIMARY KEY,
                word TEXT NOT NULL UNIQUE,
                addedDate INTEGER NOT NULL,
                priorityMeaningIndexes TEXT NOT NULL DEFAULT '[]',
                FOREIGN KEY (word) REFERENCES Words(word) ON DELETE RESTRICT
            );
        `);
    }
    createBookmarkQuizTable():Query {
        return new Query(`
            CREATE TABLE IF NOT EXISTS BookmarkQuizScore (
                word TEXT PRIMARY KEY,
                total INTEGER NOT NULL DEFAULT 0,
                correct INTEGER NOT NULL DEFAULT 0,
                incorrect INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY(word) REFERENCES Bookmark(word) ON DELETE CASCADE
            );
        `);
    }
    createBookmarkView():Query {
        return new Query(`
            CREATE VIEW IF NOT EXISTS view_Bookmark
            AS SELECT   
                Bookmark.id,
                Bookmark.addedDate,
                Words.word,
                Words.meaning,
                Bookmark.priorityMeaningIndexes,
                BookmarkQuizScore.total as quizTotal,
                BookmarkQuizScore.correct as quizCorrect,
                BookmarkQuizScore.incorrect as quizIncorrect,
                CASE
                    WHEN BookmarkQuizScore.total = 0 THEN 0
                    ELSE 100.0 * BookmarkQuizScore.incorrect / BookmarkQuizScore.total
                END as quizIncorrectRate
            FROM Bookmark
            JOIN
                BookmarkQuizScore
            ON Bookmark.word = BookmarkQuizScore.word
            JOIN
                Words
            ON Bookmark.word = Words.word;
        `);
    }

    createTriggers():Query[] {
        return [
            this.createAfterInsertBookmarkTrigger(),
        ];
    }
    createAfterInsertBookmarkTrigger():Query {
        return new Query(`
            CREATE TRIGGER AfterInsertBookmark
            AFTER INSERT ON Bookmark
            FOR EACH ROW
            BEGIN
                INSERT INTO BookmarkQuizScore (word) VALUES (NEW.word);
            END;
        `);
    }

    // DML
    selectAfterInsertBookmarkTrigger():Query {
        return new Query(`
            SELECT name
            FROM sqlite_master 
            WHERE type = 'trigger' AND name = 'AfterInsertBookmark'
        `);
    }

    insertWord(params:{word:string, meaning:string}):Query {
        return new Query(`
            INSERT INTO Words (word, meaning)
            VALUES ($word, $meaning)
        `, params);
    }

    selectWord(params:{word:string}):Query<RawDBWord> {
        return new Query(`
            SELECT *
            FROM Words
            WHERE word = $word
        `, params);
    }

    updateWord(params:{word:string, meaning:string}):Query {
        return new Query(`
            UPDATE Words
            SET meaning = $meaning
            WHERE word = $word
        `, params);
    }

    deleteWord(params:{word:string}):Query {
        return new Query(`
            DELETE FROM Words
            WHERE word = $word
        `, params);
    }
    
    insertBookmark(params:{word:string, addedDate:number}):Query {
        return new Query(`
            INSERT INTO Bookmark (word, addedDate)
            VALUES ($word, $addedDate)
        `, params);
    }

    selectBookmarkCount():Query<{count:number}> {
        return new Query(`
            SELECT count(*) as count
            FROM Bookmark
        `);
    }

    selectBookmark(params:{word:string}):Query<RawDBBookmarkView> {
        return new Query(`
            SELECT *
            FROM view_Bookmark
            WHERE word = $word
        `, params);
    }

    deleteBookmark(params:{word:string}):Query {
        return new Query(`
            DELETE FROM Bookmark
            WHERE word = $word
        `, params);
    }

    deleteAllBookmarks():Query {
        return new Query(`
            DELETE FROM Bookmark
        `);
    }

    /**
     * VIEW가 아닌 Bookmark 테이블 직접 조회
     * 
     * 테스트를 위한 메서드로, 실제 사용시에는 selectBookmark를 대신 이용할 것
     */
    selectRawBookmark(params:{word:string}):Query {
        return new Query(`
            SELECT *
            FROM Bookmark
            WHERE word = $word
        `, params);
    }

    /**
     * VIEW가 아닌 BookmarkQuizScore 테이블 직접 조회
     * 
     * 테스트를 위한 메서드로, 실제 사용시에는 selectBookmark를 대신 이용할 것
     */
    selectRawBookmarkQuizScore(params:{word:string}):Query {
        return new Query(`
            SELECT *
            FROM BookmarkQuizScore
            WHERE word = $word
        `, params);
    }

    selectBookmarks(queryFragments:{
        where?: WhereQuery,
        orderBy?: OrderByQuery,
        offset? : number,
        limit? : number,
    }):Query<RawDBBookmarkView> {
        const {
            where,
            orderBy,
            offset,
            limit
        } = queryFragments;

        return new Query(`
            SELECT
                *
            FROM view_Bookmark
            ${
                where
                ? where.query
                : ''
            }
            ${
                orderBy
                ? orderBy.query
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
        `);
    }

    updateQuizScore(params:{word:string, correct:number, incorrect:number}):Query {
        return new Query(`
            UPDATE BookmarkQuizScore
            SET total = $correct+$incorrect, correct = $correct, incorrect = $incorrect
            WHERE word = $word
        `, params);
    }

    increaseQuizScore(params:{word:string, correct:number, incorrect:number}):Query {
        return new Query(`
            UPDATE BookmarkQuizScore
            SET total = total + $correct + $incorrect, correct = correct + $correct, incorrect = incorrect + $incorrect
            WHERE word = $word
        `, params);
    }

    increaseQuizCorrect(params:{word:string}):Query {
        return new Query(`
            UPDATE BookmarkQuizScore
            SET total = total + 1, correct = correct + 1
            WHERE word = $word
        `, params);
    }
    increaseQuizIncorrect(params:{word:string}):Query {
        return new Query(`
            UPDATE BookmarkQuizScore
            SET total = total + 1, incorrect = incorrect + 1
            WHERE word = $word
        `, params);
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

    // Query Fragment
    whereQuery():WhereQuery {
        return new WhereQuery();
    }
    
}

export default WordbookQueryBuilder;