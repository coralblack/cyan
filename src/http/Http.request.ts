import { ClassType } from "src/types";
import { HttpMethod } from "./Http.method";
import { CyanRequest } from "../types/Handler";
import { Headers as HttpHeaders, Params as HttpParams, Queries as HttpQueries } from "../types/Http";

export class HttpRequest<T = any, U = any> {
  constructor(
    public readonly method: HttpMethod,
    public readonly url: string,
    public readonly headers: HttpHeaders,
    public readonly query: HttpQueries,
    public readonly params: HttpParams,
    public readonly body: T,
    public readonly startTime: Date,
    public readonly remoteAddress: string,
    public executionContext: U
  ) {}

  static getContext(req: CyanRequest): HttpRequest {
    return new HttpRequest(
      req.method,
      req.url,
      req.headers,
      req.query,
      req.params,
      req.body,
      req._startTime,
      req._remoteAddress,
      req.executionContext || {}
    );
  }
}
