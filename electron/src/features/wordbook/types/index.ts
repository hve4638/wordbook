export const ORDER = {
    HIGH : 'DESC',
    LOW : 'ASC',
} as const;
export type ORDER = typeof ORDER[keyof typeof ORDER];

export type WordRow = {
    
}