import { Handler as ExpressHandler, Response as ExpressResponse } from "express";
import { HttpError } from "./Http.error";
import { HttpRequest as HttpRequest } from "./Http.request";
import { HttpResponse } from "./Http.response";
import { Cyan } from "../core";
import { ExtendedError } from "../core/Error";
import { ContextParamAttributes } from "../router/Router.param";
import { CyanRequest } from "../types/Handler";
export interface ProcessedExpressResponse extends ExpressResponse {
    processedResponse: {
        status: number;
        headers: any;
        content: any;
    };
}
export declare abstract class Controller {
    beforeMiddleware(cyan: Cyan): ExpressHandler;
    afterMiddleware(cyan: Cyan): ExpressHandler;
    render(cyan: Cyan): ExpressHandler;
    beforeHandle(request: HttpRequest, executionContext: ContextParamAttributes): Promise<void>;
    afterHandle(request: HttpRequest, response: any, executionContext: ContextParamAttributes): Promise<HttpResponse>;
    onHttpError(request: HttpRequest, error: HttpError): Promise<HttpError>;
    onError(error: Error | ExtendedError, req: CyanRequest, cyan: Cyan): Promise<HttpResponse>;
}
