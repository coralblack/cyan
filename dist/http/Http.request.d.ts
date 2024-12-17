import { HttpMethod } from "./Http.method";
import { CyanRequest } from "../types/Handler";
import { Headers as HttpHeaders, Params as HttpParams, Queries as HttpQueries } from "../types/Http";
export declare class HttpRequest<T = any, U = any> {
    readonly method: HttpMethod;
    readonly url: string;
    readonly headers: HttpHeaders;
    readonly query: HttpQueries;
    readonly params: HttpParams;
    readonly body: T;
    readonly startTime: Date;
    readonly remoteAddress: string;
    executionContext: U;
    constructor(method: HttpMethod, url: string, headers: HttpHeaders, query: HttpQueries, params: HttpParams, body: T, startTime: Date, remoteAddress: string, executionContext: U);
    static getContext(req: CyanRequest): HttpRequest;
}
