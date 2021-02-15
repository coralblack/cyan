import { CyanRequest } from "../types/Handler";
import { Headers as HttpHeaders, Params as HttpParams, Queries as HttpQueries } from "../types/Http";

export class HttpRequest<T = any> {
  constructor(
    public readonly headers: HttpHeaders,
    public readonly query: HttpQueries,
    public readonly params: HttpParams,
    public readonly body: T
  ) {}

  static getContext(req: CyanRequest): HttpRequest {
    return new HttpRequest(req.headers, req.query, req.params, req.body);
  }
}
