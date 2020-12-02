import { EntityColumnMetadataArgs, EntityMetadataArgs, EntityRelationMetadataArgs, MiddlewareMetadataArgs, RouteMetadataArgs, RouteParamMetadataArgs, TaskMetadataArgs } from "../types/MetadataArgs";
declare class MetadataStorage {
    readonly routes: RouteMetadataArgs[];
    readonly routeParams: RouteParamMetadataArgs[];
    readonly middlewares: MiddlewareMetadataArgs[];
    readonly entities: EntityMetadataArgs[];
    readonly entityColumns: EntityColumnMetadataArgs[];
    readonly entityRelations: EntityRelationMetadataArgs[];
    readonly tasks: TaskMetadataArgs[];
}
export declare class Metadata {
    static getStorage(): MetadataStorage;
}
export {};
