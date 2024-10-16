type ElectronResult<T> = Promise<[Error|null, T]>;
type ElectronNoResult = Promise<[Error|null]>;

type WordData = {
    id : number,
    word : string,
    data : WordMeaning[],
    added_date : number,
    correct : number,
    incorrect: number,
    total: number
}

type WordMeaning = {
    from : string,
    to : string,
    fromType : string
};

type MultipleSelectOrder = 'sequence'|'interleave';

type WordSelectOption = {
    order : MultipleSelectOrder
}

type WordSelectCondition = {
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

type IPC_APIS = {
    echoSync: (message:string) => ElectronResult<string>,
    searchWord: (word:string) => ElectronResult<WordMeaning[]>,

    openBrowser: (url:string) => ElectronNoResult,

    addWord: (wordData:WordData) => ElectronResult<number>,
    removeWord: (word:string) => ElectronNoResult,
    getWord: (word:string) => ElectronResult<WordData>,
    getWords: (conditions:WordSelectCondition[], option:WordSelectOption) => ElectronResult<WordData[]>,

    addWordscoreCorrect: (word:string) => ElectronNoResult,
    addWordscoreIncorrect: (word:string) => ElectronNoResult,

    onVisible: (listener:(event)=>void) => void,
    onHide: (listener:(event)=>void) => void,
    onReceiveClipboard: (listener:(event, clipboard:string, force:boolean)=>void) => void,
};