export { initIPC } from './initIPC';
export { default as ipcping } from './ipcping';

/*
    IPC API 핸들러를 처리하는 모듈

    ./ipcping.ts : IPC API 명세
    ./ipcHandler.ts : IPC API 핸들러 함수 정의됨
    ./initIPC.ts : IPC API 핸들러 초기화

    의존 및 참조 관계
    ../../shared/ipctype.d.ts : IPC_APIS 타입 정의
    ../../preload/preload.ts : 프론트엔드에서 IPC API 정의

    새로운 IPC API를 추가할 때는 다음과 같이 진행한다.
    1. ipcping.ts에 ipc ping 추가 
    2. ipctype.d.ts의 IPC_APIS 타입에 새로운 API 타입 작성
    3. preload.ts에 IPC_APIS에 맞춰 API 정의
    4. ipcHandler.ts에 API 핸들러 함수 작성
    5. initIPC.ts에 API 핸들러 등록
*/