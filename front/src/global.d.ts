import '../../shared/ipctype.d.ts';

declare global {
    interface Window {
        electron: IPC_APIS;
    }

    type WordData = import('../../shared/ipctype.d.ts').WordData;
    type BookmarkData = import('../../shared/ipctype.d.ts').BookmarkData;
    type WordMeaning = import('../../shared/ipctype.d.ts').WordMeaning;
    type BookmarkSelectCondition = import('../../shared/ipctype.d.ts').BookmarkSelectCondition;
    type WordSelectOption = import('../../shared/ipctype.d.ts').WordSelectOption;
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