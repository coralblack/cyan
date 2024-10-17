import ts from "typescript";
export declare class TypeScriptFileResolver {
    private filePatterns;
    constructor(filePatterns: string[]);
    getFilePaths(): string[];
    readTsConfig(): ts.ParsedCommandLine;
}
