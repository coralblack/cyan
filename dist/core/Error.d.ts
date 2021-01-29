export declare function TraceableError(originalError: Error): Error;
export declare class ExtendedError extends Error {
    readonly originalError: any;
    constructor(message: string, originalError: any);
}
