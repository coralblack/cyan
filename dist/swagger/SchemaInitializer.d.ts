import { SwaggerPathType } from "./Swagger";
import { RecordSchemaType } from "./SwaggerGenerator";
export declare class DefaultSwaggerSchemaInitializer {
    private path;
    constructor(path: SwaggerPathType);
    private tsModule;
    initializeSchemas(): RecordSchemaType;
    private loadSchemaFromFile;
    private generateSchemaFromTypes;
    private loadTypeScriptModule;
}
