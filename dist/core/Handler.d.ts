import { ErrorRequestHandler, Handler as ExpressHandler, Request as ExpressRequest } from "express";
import { RouteMetadataArgs, RouteParamMetadataArgs } from "src/types/MetadataArgs";
import { Controller as HttpController } from "../http/Http.controller";
import { Request as HttpRequest } from "../http/Http.request";
interface HandledRequest extends ExpressRequest {
    handledRequest: HttpRequest;
}
export declare class Handler {
    static jsonBodyParser(): ExpressHandler;
    static beforeHandler(controller: HttpController): ExpressHandler;
    private static symActionParams;
    static getActionParams(req: HandledRequest, route: RouteMetadataArgs, actionParams: RouteParamMetadataArgs[]): any[];
    static actionHandler(controller: HttpController, route: RouteMetadataArgs): ExpressHandler;
    static afterHandler(controller: HttpController): ExpressHandler;
    static errorHandler(controller: HttpController): ErrorRequestHandler;
    static httpErrorHandler(controller: HttpController): ErrorRequestHandler;
}
export {};
