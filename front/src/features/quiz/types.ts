export type QuizResult = {
    correct: boolean;
    correctIndex: number;
    selectedIndex: number;
}

export type QuizChoices = {
    meaning: string;
    correct: boolean;
    show?: boolean;
}[];

export interface IQuiz {
    get correct():WordData;
    get choices():{meaning: string, correct: boolean, show?: boolean }[];
    select(index:number):QuizResult|undefined;
}