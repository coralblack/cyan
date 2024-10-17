import { Options, Reference, Schema } from "swagger-jsdoc";
import { SwaggerOptions } from "../types/Swagger";
export declare type RecordSchemaType = {
    [key: string]: Schema | Reference;
} | undefined;
export declare type BaseSchemaType = Schema | Reference;
export declare class SwaggerGenerator {
    private options;
    private readonly storage;
    private schemas;
    constructor(options: SwaggerOptions);
    generateSwaggerDocs(): Options;
    private initializeSchemas;
    private getTags;
    private getPaths;
    private getPathItem;
    private findSwaggerOperation;
    private getRouteTags;
    private parseRoutePath;
    private getSwaggerParameters;
    private isValidRouteParam;
    private createParameterObject;
    private getParamDescription;
    private isParamRequired;
    private getParamLocation;
    private getSchemaType;
    private getObjectSchema;
    private isArrayType;
    private getArraySchema;
    private getEnumSchema;
    private getComplexTypeSchema;
    private getPrimitiveTypeSchema;
    private readonly typeMap;
    private getSwaggerRequestBody;
    private getSwaggerResponses;
    private generateSwaggerSchemas;
    private getPropertySchema;
    private getSecuritySchemes;
}
