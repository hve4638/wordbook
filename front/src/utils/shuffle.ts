
export function shuffled<T>(array:T[], size:number|null=null):void {
    const length = size ?? array.length;

    for (let i = length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        
        [array[i], array[j]] = [array[j], array[i]];
    }
}