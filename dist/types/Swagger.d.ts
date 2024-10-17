import { ClassType } from ".";
export interface ApiOperationOptions {
    summary?: string;
    description?: string;
    security?: Record<"Authorization", string[]>;
}
export interface ApiPropertyOptions {
    type?: any;
    description?: string;
    required?: boolean;
    example?: any;
}
export interface ApiModelOptions {
    description?: string;
}
export interface ApiResponseOptions {
    description?: string;
    type?: any;
}
export interface SwaggerOperationMetadata {
    target: ClassType<any>;
    method: string;
    options: ApiOperationOptions;
}
export interface SwaggerPropertyMetadata {
    target: ClassType<any>;
    propertyKey: string;
    options: ApiPropertyOptions;
}
export interface SwaggerModelMetadata {
    target: ClassType<any>;
    options: ApiModelOptions;
}
export interface SwaggerResponseMetadata {
    target: ClassType<any>;
    method: string;
    statusCode: number;
    options: ApiResponseOptions;
}
export interface ApiTagOptions {
    name: string;
    description?: string;
}
export interface SwaggerOptions {
    info: {
        title: string;
        description?: string;
        version: string;
        contact?: {
            name?: string;
            url?: string;
            email?: string;
        };
        license?: {
            name: string;
            url?: string;
        };
    };
    uri?: string;
    typesPath?: string[];
}
