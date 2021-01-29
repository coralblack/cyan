import * as bodyParser from "body-parser";
import { CorsOptions, CorsOptionsDelegate } from "cors";
import { Controller as HttpController } from "../http/Http.controller";
import { CyanRequest, ErrorHandlerFunction, HandlerFunction } from "../types/Handler";
import { RouteMetadataArgs, RouteParamMetadataArgs } from "../types/MetadataArgs";
export declare class Handler {
    static beforeHandler(controller: HttpController): HandlerFunction;
    private static symActionParams;
    private static paramTransformer;
    static getActionParams(req: CyanRequest, route: RouteMetadataArgs, actionParams: RouteParamMetadataArgs[]): any[];
    static actionHandler(controller: HttpController, route: RouteMetadataArgs): HandlerFunction;
    static afterHandler(controller: HttpController): HandlerFunction;
    static errorHandler(controller: HttpController): ErrorHandlerFunction;
    static httpErrorHandler(controller: HttpController): ErrorHandlerFunction;
    static accessLogger(name: string): HandlerFunction;
    static jsonBodyParser(options?: bodyParser.OptionsJson): HandlerFunction;
    static urlEncodedBodyParser(options?: bodyParser.OptionsUrlencoded): HandlerFunction;
    static corsHandler(options?: CorsOptions | CorsOptionsDelegate): HandlerFunction;
}
