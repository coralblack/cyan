import { ApiTagOptions, SwaggerModelMetadata, SwaggerOperationMetadata, SwaggerPropertyMetadata, SwaggerResponseMetadata } from "src/swagger";
import { EntityColumnMetadataArgs, EntityMetadataArgs, EntityRelationMetadataArgs, MiddlewareMetadataArgs, RouteMetadataArgs, RouteParamMetadataArgs, TaskMetadataArgs } from "../types/MetadataArgs";
export declare class MetadataStorage {
    readonly routes: RouteMetadataArgs[];
    readonly routeParams: RouteParamMetadataArgs[];
    readonly middlewares: MiddlewareMetadataArgs[];
    readonly entities: EntityMetadataArgs[];
    readonly entityColumns: EntityColumnMetadataArgs[];
    readonly entityRelations: EntityRelationMetadataArgs[];
    readonly tasks: TaskMetadataArgs[];
    readonly swaggerOperations: SwaggerOperationMetadata[];
    readonly swaggerProperties: SwaggerPropertyMetadata[];
    readonly swaggerModels: SwaggerModelMetadata[];
    readonly swaggerResponses: SwaggerResponseMetadata[];
    readonly swaggerControllerTags: {
        target: any;
        tags: ApiTagOptions[];
    }[];
}
export declare class Metadata {
    static getStorage(): MetadataStorage;
}
