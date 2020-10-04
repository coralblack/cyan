export declare class Logger {
    appName: string;
    static _instance: Logger;
    static getInstance(): Logger;
    static setInstance(logger: Logger): void;
    log(...args: any[]): void;
    debug(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    info(...args: any[]): void;
}
