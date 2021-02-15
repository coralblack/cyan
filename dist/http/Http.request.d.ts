import { CyanRequest } from "../types/Handler";
import { Headers as HttpHeaders, Params as HttpParams, Queries as HttpQueries } from "../types/Http";
export declare class HttpRequest<T = any> {
    readonly headers: HttpHeaders;
    readonly query: HttpQueries;
    readonly params: HttpParams;
    readonly body: T;
    constructor(headers: HttpHeaders, query: HttpQueries, params: HttpParams, body: T);
    static getContext(req: CyanRequest): HttpRequest;
}
