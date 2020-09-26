import { HttpError } from "./Http.error";
import { Headers as HttpHeaders } from "../types/Http";
import * as Http from ".";

export class Response {
  constructor(public status: Http.Status, public content?: string | object, public headers?: HttpHeaders) {}

  static ok(content: string | object): Response {
    return new Response(Http.Status.Ok, content);
  }

  static notFound(content: string | object, headers?: HttpHeaders): HttpError {
    return new HttpError(Http.Status.NotFound, content, headers);
  }

  static notImplemented(content: string | object, headers?: HttpHeaders): HttpError {
    return new HttpError(Http.Status.NotImplemented, content, headers);
  }

  static badRequest(content: string | object, headers?: HttpHeaders): HttpError {
    return new HttpError(Http.Status.BadRequest, content, headers);
  }

  setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }

  setHeaders(headers: HttpHeaders): void {
    this.headers = Object.assign(this.headers, headers);
  }
}
