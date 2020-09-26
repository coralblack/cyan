import { Status as HttpStatus } from "./Http.status";
import { Headers as HttpHeaders } from "../types/Http";
export declare class HttpError extends Error {
    status: HttpStatus;
    content?: string | object;
    headers?: HttpHeaders;
    constructor(status: HttpStatus, content?: string | object, headers?: HttpHeaders);
}
