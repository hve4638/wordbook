export type QuizResult = {
    correct: boolean;
    correctIndex: number;
    selectedIndex: number;
}

export type QuizChoice = {
    word: string;
    meaning: WordMeaning;
    correct: boolean;
    show?: boolean;
};

export interface IQuiz {
    get correctWord():WordData;
    get choices():QuizChoice[];
    get finished():boolean;
    selectAnswer(index:number):boolean;
}