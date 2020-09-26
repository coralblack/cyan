import { HttpError } from "./Http.error";
import { Headers as HttpHeaders } from "../types/Http";
import * as Http from ".";
export declare class Response {
    status: Http.Status;
    content?: string | object;
    headers?: HttpHeaders;
    constructor(status: Http.Status, content?: string | object, headers?: HttpHeaders);
    static ok(content: string | object): Response;
    static notFound(content: string | object, headers?: HttpHeaders): HttpError;
    static notImplemented(content: string | object, headers?: HttpHeaders): HttpError;
    static badRequest(content: string | object, headers?: HttpHeaders): HttpError;
    setHeader(name: string, value: string): void;
    setHeaders(headers: HttpHeaders): void;
}
