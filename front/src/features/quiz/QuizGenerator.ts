import { shuffled } from 'utils/shuffle';
import { IQuiz, QuizChoices, QuizResult } from './types';

interface QuizGeneratorActions {
    onPull: (offset, limit) => Promise<WordData[]|null>;
    onQuizCorrect: (word:string) => void;
    onQuizIncorrect: (word:string) => void;
}

export class QuizGenerator {
    #nopull:boolean = false;
    #pullOffset:number = 0;
    #pullLimit:number = 10;
    #actions:QuizGeneratorActions;
    #currentIndex = 0;
    #words:WordData[] = [];
    #lastQuiz?:Quiz;
    
    constructor(actions:QuizGeneratorActions) {
        this.#actions = actions;
    }

    get currentIndex() {
        return this.#currentIndex;
    }

    get pulledWordsLength() {
        return this.#words.length;
    }

    async current():Promise<Quiz> {
        if (this.#lastQuiz) {
            return this.#lastQuiz;
        }
        else {
            return this.next();
        }
    }

    async next():Promise<Quiz> {
        if (this.#currentIndex >= this.#words.length) {
            const pulled = await this.#pullWords();
            this.#words.push(...pulled);
            this.#currentIndex = this.#currentIndex % this.#words.length;
        }

        const correct = this.#words[this.#currentIndex++];
        const incorrects = this.#getRandomWords(3, [correct.word], 10);
        this.#lastQuiz = new Quiz(correct, incorrects, this.#actions);

        return this.#lastQuiz;
    }

    async #pullWords() {
        if (this.#nopull) return [];
        
        let words:WordData[];
        words = await this.#actions.onPull(this.#pullOffset, this.#pullLimit) ?? [];
        if (words.length === 0) {
            this.#nopull = true;
        }
        else {
            this.#pullOffset += words.length;
        }
        return words;
    }

    #getRandomWords(count:number, exceptWords:string[], maxRetry:number):WordData[] {
        const results:WordData[] = [];
        const copiedExceptWords:string[] = [...exceptWords];
        
        for (let i = 0; i < count; i++) {
            if (this.#words.length <= copiedExceptWords.length) break;

            const wordData = this.#getRandomWord(copiedExceptWords, maxRetry);
            if (wordData) {
                copiedExceptWords.push(wordData.word);
                results.push(wordData);
            }
        }
        return results;
    }

    #getRandomWord(exceptWords:string[], maxRetry:number):WordData|null {
        for (let i = 0; i < maxRetry; i++) {
            const index = Math.floor(Math.random() * this.#words.length);
            const wordData = this.#words[index];
            const word = wordData.word;
            if (!exceptWords.includes(word)) {
                return wordData;
            }
        }

        return null;
    }
}

class Quiz implements IQuiz {
    #choices:QuizChoices;
    #correct:WordData;
    #incorects:WordData[];
    #actions:QuizGeneratorActions;
    #alreadySelected:boolean = false;

    constructor(correct:WordData, incorrects:WordData[], actions:QuizGeneratorActions) {
        this.#correct = correct;
        this.#incorects = incorrects;

        const getTo = (wordData:WordData) => this.#getPriorityWordMeaning(wordData).to;
        this.#choices = [
            { meaning: getTo(correct), correct: true },
            ...incorrects.map((wordData) => { return {meaning: getTo(wordData), correct: false } })
        ];
        this.#actions = actions;

        shuffled(this.#choices);
    }

    #getPriorityWordMeaning(wordData:WordData) {
        const indexes = wordData.priority_meaning_indexes;
        if (indexes.length === 0) {
            return wordData.data[0];
        }
        else {
            const size = indexes.length;
            const index = indexes[Math.floor(Math.random() * size)];

            return wordData.data[index];
        }
    }

    get correct() {
        return this.#correct;
    }

    get choices() {
        return this.#choices;
    }

    get finished() {
        return this.#alreadySelected;
    }

    select(index:number):QuizResult|undefined {
        if (this.#alreadySelected) return;
        this.#alreadySelected = true;

        if (this.#choices[index].correct) {
            this.#actions.onQuizCorrect(this.#correct.word);
            return {
                correct: true,
                correctIndex: index,
                selectedIndex: index,
            };
        }
        else {
            this.#actions.onQuizIncorrect(this.#correct.word);

            for (let i in this.#choices) {
                if (this.#choices[i].correct) {
                    return {
                        correct: false,
                        correctIndex: Number(i),
                        selectedIndex: index,
                    };
                }
            }
        }
    }
}