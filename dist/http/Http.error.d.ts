import { Status as HttpStatus } from "./Http.status";
import { Headers as HttpHeaders } from "../types/Http";
export declare class HttpError {
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
}
