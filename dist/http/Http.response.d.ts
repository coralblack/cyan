/// <reference types="node" />
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
export declare class HttpResponder {
    static done(status: HttpStatus, content: string | object): HttpResponse;
    static ok(content: string | object): HttpResponse;
    static badRequest: {
        (content?: string | object, headers?: HttpHeaders): HttpError;
        code(code: import("fs").Mode): {
            (content?: string | object, headers?: HttpHeaders): HttpError;
            message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
        };
        message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
    };
    static unauthorized: {
        (content?: string | object, headers?: HttpHeaders): HttpError;
        code(code: import("fs").Mode): {
            (content?: string | object, headers?: HttpHeaders): HttpError;
            message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
        };
        message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
    };
    static forbidden: {
        (content?: string | object, headers?: HttpHeaders): HttpError;
        code(code: import("fs").Mode): {
            (content?: string | object, headers?: HttpHeaders): HttpError;
            message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
        };
        message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
    };
    static notFound: {
        (content?: string | object, headers?: HttpHeaders): HttpError;
        code(code: import("fs").Mode): {
            (content?: string | object, headers?: HttpHeaders): HttpError;
            message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
        };
        message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
    };
    static methodNotAllowed: {
        (content?: string | object, headers?: HttpHeaders): HttpError;
        code(code: import("fs").Mode): {
            (content?: string | object, headers?: HttpHeaders): HttpError;
            message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
        };
        message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
    };
    static conflict: {
        (content?: string | object, headers?: HttpHeaders): HttpError;
        code(code: import("fs").Mode): {
            (content?: string | object, headers?: HttpHeaders): HttpError;
            message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
        };
        message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
    };
    static toManyRequests: {
        (content?: string | object, headers?: HttpHeaders): HttpError;
        code(code: import("fs").Mode): {
            (content?: string | object, headers?: HttpHeaders): HttpError;
            message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
        };
        message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
    };
    static notImplemented: {
        (content?: string | object, headers?: HttpHeaders): HttpError;
        code(code: import("fs").Mode): {
            (content?: string | object, headers?: HttpHeaders): HttpError;
            message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
        };
        message(message: string): (content?: string | object, headers?: HttpHeaders) => HttpError;
    };
}
