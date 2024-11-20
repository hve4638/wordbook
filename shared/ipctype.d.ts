type ElectronResult<T> = Promise<[Error|null, T]>;
type ElectronNoResult = Promise<[Error|null]>;

type BookmarkData = {
    id : number,
    word : string,
    meaning : WordMeaning[],
    addedDate : number,
    quizCorrect : number,
    quizIncorrect: number,
    quizTotal: number
    quizIncorrectRate : number,
}
type WordData = {
    id : number,
    word : string,
    data : WordMeaning[],
    addedDate : number,
    quizCorrect : number,
    quizIncorrect: number,
    quizTotal: number
}

type WordMeaning = {
    from : string,
    to : string,
    fromType : string,
    star? : boolean,
};

type MultipleSelectOrder = 'sequence'|'interleave';

type WordSelectOption = {
    order : MultipleSelectOrder
}

type BookmarkSelectCondition = {
    /** 낮은 퀴즈 등장 빈도 순 */
    lowQuizFrequency?: boolean;
    /** 높은 퀴즈 등장 빈도 순 */
    highQuizFrequency?: boolean;

    /** 낮은 퀴즈 오답률 순 */
    lowQuizIncorrect?: boolean;
    /** 높은 퀴즈 오답률 순 */
    highQuizIncorrect?: boolean;

    /** 최소 오답률 비율 제한 (0-100) */
    lowIncorrectRateLimit?: number;
    /** 최대 오답률 비율 제한 (0-100) */
    highIncorrectRateLimit?: number;

    /** 최소 퀴즈 등장 횟수 제한 */
    lowFrequencyLimit?: number;
    /** 최대 퀴즈 등장 횟수 제한 */
    highFrequencyLimit?: number;

    offset? : number,
    limit? : number,
    shuffle? : boolean,
    shuffleGroupSize? : number,

    /** 오래된 순 정렬 */
    oldest? : boolean,
    /** 최신 순 정렬 */
    latest? : boolean,
}
/**
 * @deprecated Use BookmarkSelectCondition instead
 */
type WordSelectCondition = BookmarkSelectCondition;

type IPC_APIS = {
    echoSync: (message:string) => ElectronResult<string>,
    openBrowser: (url:string) => ElectronNoResult,
    searchWord: (word:string) => ElectronResult<WordMeaning[]>,
    editWord : (word:string, meaning:WordMeaning[]) => ElectronNoResult,
    addBookmark: (word:string) => ElectronResult<number>,
    getBookmark: (word:string) => ElectronResult<BookmarkData>,
    getBookmarks: (conditions:BookmarkSelectCondition[], option:WordSelectOption) => ElectronResult<BookmarkData[]>,
    deleteBookmark: (word:string) => ElectronNoResult,
    increaseBookmarkQuizScore: (word:string, correct:number, incorrect:number) => ElectronNoResult,

    onVisible: (listener:(event)=>void) => void,
    onHide: (listener:(event)=>void) => void,
    onReceiveClipboard: (listener:(event, clipboard:string, force:boolean)=>void) => void,
};