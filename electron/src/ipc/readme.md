# IPC

## IPC API 추가 방법

1. `../../shared/ipctype.d.ts`에 정의되어있는 `IPC_APIS`에 API 정의 추가
2. `./ipcping.ts`에 PING 추가
3. `./ipcHandler.ts`에 함수 작성
4. `./initIPC.ts`에 핸들링 코드 추가
5. `../preload/preload.ts`에 노출할 API 함수 작성

## 작성 규칙

반환값

- IPC API는 비동기이며, `[에러, 필요한 값...]` 으로 구성된다.
- 첫번째 *에러* 인자는 문제 발생시 에러 내용이 들어가며, 정상 작동하였다면 null을 넣는다.
- `node:fs`의 동기API의 반환 형식과 유사하게 작동한다.
- 미리 정의된 type `ElectronResult`, `ElectronNoResult`을 활용해 정의할 것