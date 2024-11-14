import { RecordSchemaType } from "./SwaggerGenerator";
export declare class TypescriptSchemaGenerator {
    private ts;
    private filePatterns;
    constructor(ts: typeof import("typescript"), filePatterns: string[]);
    private typeChecker;
    private schemas;
    generateSchema(): RecordSchemaType;
    private extractTypes;
}
