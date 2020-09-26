import { HttpError } from "./Http.error";
import { Request as HttpRequest } from "./Http.request";
import { Response as HttpResponse } from "./Http.response";
export declare abstract class Controller {
    beforeHandle(request: HttpRequest): Promise<void>;
    afterHandle(request: HttpRequest, response: any): Promise<HttpResponse>;
    onHttpError(request: HttpRequest, error: HttpError): Promise<HttpError>;
    onError(error: Error): Promise<HttpResponse>;
}
