/**
 * @param data
 * @param maxRetry 선택 최대 시도 횟수
 * @returns 
 */
export function randomElement<T>(array:T[]):T {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}