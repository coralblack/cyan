import { RouteMetadataArgs, RouteParamMetadataArgs } from "src/types/MetadataArgs";
import { Controller as HttpController } from "../http/Http.controller";
import { CyanRequest, ErrorHandlerFunction, HandlerFunction } from "../types/Handler";
export declare class Handler {
    static jsonBodyParser(): HandlerFunction;
    static beforeHandler(controller: HttpController): HandlerFunction;
    private static symActionParams;
    static getActionParams(req: CyanRequest, route: RouteMetadataArgs, actionParams: RouteParamMetadataArgs[]): any[];
    static actionHandler(controller: HttpController, route: RouteMetadataArgs): HandlerFunction;
    static afterHandler(controller: HttpController): HandlerFunction;
    static errorHandler(controller: HttpController): ErrorHandlerFunction;
    static httpErrorHandler(controller: HttpController): ErrorHandlerFunction;
}
