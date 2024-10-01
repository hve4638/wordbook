export class IPCError extends Error {
    constructor(message) {
        super(message);
        this.name = 'IPCError';
    }
}