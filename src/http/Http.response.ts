import { HttpError } from "./Http.error";
import { Headers as HttpHeaders } from "../types/Http";
import * as Http from ".";

export class Response {
  constructor(public status: Http.Status, public content?: string | object, public headers?: HttpHeaders) {}

  static ok(content: string | object): Response {
    return new Response(Http.Status.Ok, content);
  }

  static notFound(content?: string | object, headers?: HttpHeaders): HttpError {
    return new HttpError(Http.Status.NotFound, content || "Not Found", headers);
  }

  static notImplemented(content?: string | object, headers?: HttpHeaders): HttpError {
    return new HttpError(Http.Status.NotImplemented, content || "Not Implemented", headers);
  }

  static badRequest(content?: string | object, headers?: HttpHeaders): HttpError {
    return new HttpError(Http.Status.BadRequest, content || "Bad Request", headers);
  }

  static methodNotAllowed(content?: string | object, headers?: HttpHeaders): HttpError {
    return new HttpError(Http.Status.MethodNotAllowed, content || "Method Not Allowed", headers);
  }

  setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }

  setHeaders(headers: HttpHeaders): void {
    this.headers = Object.assign(this.headers, headers);
  }
}
