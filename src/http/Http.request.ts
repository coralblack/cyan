import { Request as ExpressRequest } from "express";
import { Headers as HttpHeaders } from "../types/Http";

export class Request {
  constructor(public readonly headers: HttpHeaders) {}

  static getContext(request: ExpressRequest): Request {
    return new Request(request.headers as HttpHeaders);
  }
}
