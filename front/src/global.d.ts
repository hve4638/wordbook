import '../../shared/ipctype.d.ts';

declare global {
    interface Window {
        electron: IPC_APIS;
    }

    type WordData = import('../../shared/ipctype.d.ts').WordData;
    type WordMeaning = import('../../shared/ipctype.d.ts').WordMeaning;
    type WordSelectCondition = import('../../shared/ipctype.d.ts').WordSelectCondition;
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