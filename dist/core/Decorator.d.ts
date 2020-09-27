import { MiddlewareMetadataArgs, RouteMetadataArgs, RouteParamMetadataArgs } from "../types/MetadataArgs";
declare class MetadataStorage {
    readonly routes: RouteMetadataArgs[];
    readonly routeParams: RouteParamMetadataArgs[];
    readonly middlewares: MiddlewareMetadataArgs[];
}
export declare class Metadata {
    static getStorage(): MetadataStorage;
}
export {};
