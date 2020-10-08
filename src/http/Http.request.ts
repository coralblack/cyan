import { CyanRequest } from "../types/Handler";
import { Headers as HttpHeaders } from "../types/Http";

export class HttpRequest {
  constructor(public readonly headers: HttpHeaders) {}

  static getContext(request: CyanRequest): HttpRequest {
    return new HttpRequest(request.headers);
  }
}
