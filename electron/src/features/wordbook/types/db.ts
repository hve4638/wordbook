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
    meanings:string,
}

export type DBWord = {
    word:string,
    meanings:WordMeaning[]
}

export type RawDBBookmarkView = {
    id : number,
    word : string,
    meanings: string,
    addedDate : number,
    quizTotal : number,
    quizCorrect : number,
    quizIncorrect : number,
    quizIncorrectRate : number,
}
export type DBBookmarkView = {
    id : number,
    word : string,
    meanings: WordMeaning[],
    addedDate : number,

    quizTotal : number,
    quizCorrect : number,
    quizIncorrect : number,
    quizIncorrectRate : number,
}

/**
 * @deprecated
 */
export type Meaning = WordMeaning;