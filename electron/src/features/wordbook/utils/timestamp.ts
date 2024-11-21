
/**
 * 현재 시간을 UNIX timestamp를 반환 (UTC 기준)
 * @returns 
 */
export function getUNIXTimestamp():number {
    return Math.floor(Date.now() / 1000);
}