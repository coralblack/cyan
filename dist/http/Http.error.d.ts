import { Status as HttpStatus } from "./Http.status";
import { Headers as HttpHeaders } from "../types/Http";
export declare class HttpError {
    status: HttpStatus;
    content?: string | object | undefined;
    headers?: HttpHeaders | undefined;
    readonly additional: {
        [key: string]: any;
    };
    readonly default: string;
    constructor(status: HttpStatus, content?: string | object | undefined, headers?: HttpHeaders | undefined);
    code(val: string | number): this;
    message(val: string): this;
    data(val: string): this;
}
