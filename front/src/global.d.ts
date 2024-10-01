import type { WordData } from 'types/words';
import type { WordSelectCondition } from 'api/local/types'

declare global {

    interface Window {
        electron: {
            echoSync: (message:string) => [Error|null, string],
            searchWord: (word:string) => Promise<[Error|null, WordMeaning[]]>,
    
            addWord: (wordData:WordData) => Promise<[Error|null, number]>,
            removeWord: (word:string) => Promise<[Error|null]>,
            getWord: (word:string) => Promise<[Error|null, WordData]>,
            getWords: (offset:number, limit:number, condition:WordSelectCondition) => Promise<[Error|null, WordData[]]>,
            
            getLatestWords: (offset:number, limit:number) => Promise<[Error|null, WordData[]]>,

            addWordscoreCorrect: (word:string) => Promise<[Error|null]>,
            addWordscoreIncorrect: (word:string) => Promise<[Error|null]>,
    
            onVisible: (listener:(event)=>void) => void,
            onHide: (listener:(event)=>void) => void,
            onReceiveClipboard: (listener:(event, clipboard:string, force:boolean)=>void) => void,
        };
    }
}

declare module '*.png' {
    const value: string;
    export default value;
}

declare module '*.jpg' {
    const value: string;
    export default value;
}

declare module '*.jpeg' {
    const value: string;
    export default value;
}

declare module '*.svg' {
    const value: string;
    export default value;
}