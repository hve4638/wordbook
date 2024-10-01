export type WordData = {
    id : number,
    word : string,
    data : WordMeaning[]
}

export type WordMeaning = {
    from : string,
    to : string,
    fromType : string
};

export type WordSelectCondition = {
    lessQuizFrequency?: boolean;
    moreQuizFrequency?: boolean;

    lessQuizIncorrect?: boolean;
    moreQuizIncorrect?: boolean;

    lastest?: boolean;
    oldest?: boolean;
    shuffle?: boolean;
}