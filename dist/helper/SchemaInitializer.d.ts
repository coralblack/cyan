import { RecordSchemaType } from "src/core";
interface SwaggerSchemaOptions {
    schemaPath?: string;
    typesPath?: string[];
}
export declare class DefaultSwaggerSchemaInitializer {
    private options;
    constructor(options: SwaggerSchemaOptions);
    private tsModule;
    initializeSchemas(): RecordSchemaType;
    private loadSchemaFromFile;
    private generateSchemaFromTypes;
    private loadTypeScriptModule;
    private handleError;
}
export {};
