import { RouteMetadataArgs, RouteParamMetadataArgs } from "../types/MetadataArgs";
declare class MetadataStorage {
    readonly routes: RouteMetadataArgs[];
    readonly routeParams: RouteParamMetadataArgs[];
}
export declare class Metadata {
    static getStorage(): MetadataStorage;
}
export {};
