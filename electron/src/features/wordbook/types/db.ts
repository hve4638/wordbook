export type DBWordDataRow = {
    id : number,
    word : string,
    data : string,
    total:number,
    priority_meaning_indexes:string,
    correct:number,
    incorrect:number
    incorrect_rate:number,
}

export type RawDBWord = {
    word:string,
    meaning:string,
}

export type DBWord = {
    word:string,
    meaning:Meaning[]
}

export type RawDBBookmarkView = {
    id : number,
    word : string,
    meaning: string,
    addedDate : number,
    priorityMeaningIndexes : string,

    quizTotal : number,
    quizCorrect : number,
    quizIncorrect : number,
    quizIncorrectRate : number,
}
export type DBBookmarkView = {
    id : number,
    word : string,
    meaning: Meaning[],
    addedDate : number,

    quizTotal : number,
    quizCorrect : number,
    quizIncorrect : number,
    quizIncorrectRate : number,
}

export type Meaning = {
    from : string;
    fromType : string;
    to : string;
    star? : boolean;
}