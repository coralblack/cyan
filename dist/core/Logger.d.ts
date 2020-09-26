export declare class Logger {
    static getInstance(): Logger;
    debug(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    info(...args: any[]): void;
}
