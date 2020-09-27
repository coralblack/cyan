import { CyanRequest } from "../types/Handler";
import { Headers as HttpHeaders } from "../types/Http";
export declare class Request {
    readonly headers: HttpHeaders;
    constructor(headers: HttpHeaders);
    static getContext(request: CyanRequest): Request;
}
