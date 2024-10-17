import { RecordSchemaType } from "./SwaggerGenerator";
export declare class TypescriptSchemaGenerator {
    private filePatterns;
    private typeChecker;
    private schemas;
    constructor(filePatterns: string[]);
    generateSchema(): RecordSchemaType;
    private extractTypes;
}
