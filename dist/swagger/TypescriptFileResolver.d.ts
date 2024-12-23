import type { ParsedCommandLine } from "typescript";
export declare class TypeScriptFileResolver {
    private ts;
    readonly filePatterns: string[];
    constructor(ts: typeof import("typescript"), filePatterns: string[]);
    getFilePaths(): string[];
    readTsConfig(): ParsedCommandLine;
}
