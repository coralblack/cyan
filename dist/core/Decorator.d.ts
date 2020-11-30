import { MiddlewareMetadataArgs, RelationEntityColumnMetadataArgs, RepositoryColumnMetadataArgs, RepositoryMetadataArgs, RouteMetadataArgs, RouteParamMetadataArgs, TaskMetadataArgs } from "../types/MetadataArgs";
declare class MetadataStorage {
    readonly routes: RouteMetadataArgs[];
    readonly routeParams: RouteParamMetadataArgs[];
    readonly middlewares: MiddlewareMetadataArgs[];
    readonly repositories: RepositoryMetadataArgs[];
    readonly repositoryColumns: RepositoryColumnMetadataArgs[];
    readonly relationEntityColumns: RelationEntityColumnMetadataArgs[];
    readonly tasks: TaskMetadataArgs[];
}
export declare class Metadata {
    static getStorage(): MetadataStorage;
}
export {};
