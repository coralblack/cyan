import { Cyan } from "src/core";
import { Controller } from "./Http.controller";
import { HttpError } from "./Http.error";
import { HttpRequest as HttpRequest } from "./Http.request";
import { HttpResponse } from "./Http.response";
export declare class ApiController extends Controller {
    afterHandle(request: HttpRequest, response: any): Promise<HttpResponse>;
    onHttpError(request: HttpRequest, error: HttpError): Promise<HttpError>;
    onError(error: Error, cyan: Cyan): Promise<HttpResponse>;
}
