import { CyanRequest } from "../types/Handler";
import { Headers as HttpHeaders } from "../types/Http";
export declare class HttpRequest {
    readonly headers: HttpHeaders;
    constructor(headers: HttpHeaders);
    static getContext(request: CyanRequest): HttpRequest;
}
