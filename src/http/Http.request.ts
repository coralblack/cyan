import { CyanRequest } from "../types/Handler";
import { Headers as HttpHeaders } from "../types/Http";

export class Request {
  constructor(public readonly headers: HttpHeaders) {}

  static getContext(request: CyanRequest): Request {
    return new Request(request.headers);
  }
}
