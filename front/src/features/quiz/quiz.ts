import { IQuiz, QuizChoice, QuizResult } from './types';
import { shuffled } from 'utils/shuffle';
import { randomElement } from 'utils/random';

interface QuizActions {
    onCorrectAnswer?: (correct:QuizChoice) => void;
    onIncorrectAnswer?: (correct:QuizChoice, incorrect:QuizChoice) => void;
}

class Quiz implements IQuiz {
    #wordData:BookmarkData;
    #references:BookmarkData[];

    #choices?:QuizChoice[];
    #selectFinished:boolean = false;
    #actions:QuizActions;

    constructor(wordData:BookmarkData, references:BookmarkData[], actions:QuizActions={}) {
        this.#wordData = wordData;
        this.#references = references;
        this.#actions = actions;
    }

    get correctWord() {
        return this.#wordData;
    }

    get finished() {
        return this.#selectFinished;
    }

    get choices() {
        if (!this.#choices) {
            const correctChoice = this.#makeChoice(this.#wordData, true);
            const incorrectChoices = this.#getRandomWords(3, [this.#wordData.word]);
            this.#choices = [
                correctChoice,
                ...incorrectChoices.map(item => this.#makeChoice(item)),
            ];

            shuffled(this.#choices);
        }

        return this.#choices;
    }

    #makeChoice(bookmarkData:BookmarkData, isCorrect:boolean=false):QuizChoice {
        return {
            word: bookmarkData.word,
            correct: isCorrect,
            meaning: this.#getStarredMeaning(bookmarkData.meanings),
            show : false,
        }
    }
    
    #getStarredMeaning(meanings:WordMeaning[]) {
        const starred = meanings.filter(item => item.star);
        if (starred.length === 0) {
            return meanings[0];
        }
        else {
            return starred[Math.floor(Math.random() * starred.length)];
        }
    }

    selectAnswer(index:number) {
        if (this.#selectFinished || !this.#choices) return false;
        this.#selectFinished = true;

        if (this.#choices[index].correct) {
            this.#choices[index].show = true;
            if (this.#actions.onCorrectAnswer) {
                this.#actions.onCorrectAnswer(this.#choices[index]);
            }
        }
        else {
            this.#choices[index].show = true;
            
            for (let i in this.#choices) {
                if (this.#choices[i].correct) {
                    this.#choices[i].show = true;
                    
                    if (this.#actions.onIncorrectAnswer) {
                        this.#actions.onIncorrectAnswer(this.#choices[i], this.#choices[index]);
                    }
                    break;
                }
            }
        }
        return true;
    }

    /**
     * 
     * @param count 가져올 단어 수
     * @param exceptWords 제외할 단어
     * @param maxRetry 각 단어의 최대 시도 횟수, 이를 넘어갈 시 가져올 단어 수보다 적게 가져올 수 있음
     * @returns 
     */
    #getRandomWords(count:number, exceptWords:string[], maxRetry:number=64):BookmarkData[] {
        const results:BookmarkData[] = [];
        const copiedExceptWords:string[] = [...exceptWords];
        
        for (let i = 0; i < count; i++) {
            if (this.#references.length <= copiedExceptWords.length) break;

            const element = this.#getRandomWord(copiedExceptWords, maxRetry);
            if (element) {
                copiedExceptWords.push(element.word);
                results.push(element);
            }
        }
        return results;
    }

    /**
     * 
     * @param exceptWords 제외 단어
     * @param maxRetry 선택 최대 시도 횟수
     * @returns 
     */
    #getRandomWord(exceptWords:string[], maxRetry:number):BookmarkData|null {
        for (let i = 0; i < maxRetry; i++) {
            const element = randomElement(this.#references);

            const word = element.word;
            if (!exceptWords.includes(word)) {
                return element;
            }
        }
        return null;
    }
}

export default Quiz;