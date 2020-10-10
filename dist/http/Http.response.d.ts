import { HttpError } from "./Http.error";
import { Status as HttpStatus } from "./Http.status";
import { Headers as HttpHeaders } from "../types/Http";
export declare class HttpResponse {
    status: HttpStatus;
    content?: string | object;
    headers?: HttpHeaders;
    readonly additional: {
        [key: string]: any;
    };
    constructor(status: HttpStatus, content?: string | object, headers?: HttpHeaders);
    code(val: string | number): this;
    message(val: string): this;
    data(val: string): this;
    setHeader(name: string, value: string): void;
    setHeaders(headers: HttpHeaders): void;
}
declare type ResponderBody = {
    (content?: string | object, headers?: HttpHeaders): HttpError;
};
declare type ResponderWithCode = {
    (content?: string | object, headers?: HttpHeaders): HttpError;
    message: (message: string) => ResponderBody;
};
declare type Responder = {
    (content?: string | object, headers?: HttpHeaders): HttpError;
    code: (code: number | string) => ResponderWithCode;
    message: (message: string) => ResponderBody;
};
export declare class HttpResponder {
    static done(status: HttpStatus, content: string | object): HttpResponse;
    static ok(content: string | object): HttpResponse;
    static badRequest: Responder;
    static unauthorized: Responder;
    static forbidden: Responder;
    static notFound: Responder;
    static methodNotAllowed: Responder;
    static conflict: Responder;
    static toManyRequests: Responder;
    static internalServerError: Responder;
    static notImplemented: Responder;
    static withStatus: (status: HttpStatus) => Responder;
}
export {};
