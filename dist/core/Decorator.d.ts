import { EntityColumnMetadataArgs, EntityMetadataArgs, MiddlewareMetadataArgs, RouteMetadataArgs, RouteParamMetadataArgs, TaskMetadataArgs } from "../types/MetadataArgs";
declare class MetadataStorage {
    readonly routes: RouteMetadataArgs[];
    readonly routeParams: RouteParamMetadataArgs[];
    readonly middlewares: MiddlewareMetadataArgs[];
    readonly entities: EntityMetadataArgs[];
    readonly entityColumns: EntityColumnMetadataArgs[];
    readonly tasks: TaskMetadataArgs[];
}
export declare class Metadata {
    static getStorage(): MetadataStorage;
}
export {};
