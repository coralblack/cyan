import { HttpError } from "./Http.error";
import { Status as HttpStatus } from "./Http.status";
import { Headers as HttpHeaders } from "../types/Http";

export class HttpResponse {
  public readonly additional: { [key: string]: any } = {};

  constructor(public status: HttpStatus, public content?: string | object, public headers?: HttpHeaders) {}

  code(val: string | number): this {
    this.additional.code = val;

    return this;
  }

  message(val: string): this {
    this.additional.message = val;

    return this;
  }

  data(val: string): this {
    this.additional.data = val;

    return this;
  }

  setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }

  setHeaders(headers: HttpHeaders): void {
    this.headers = Object.assign(this.headers, headers);
  }
}

type ResponderBody = {
  (content?: string | object, headers?: HttpHeaders): HttpError;
};

type ResponderWithCode = {
  (content?: string | object, headers?: HttpHeaders): HttpError;
  message: (message: string) => ResponderBody;
};

type Responder = {
  (content?: string | object, headers?: HttpHeaders): HttpError;
  code: (code: number | string) => ResponderWithCode;
  message: (message: string) => ResponderBody;
};

const responder = (statusCode: HttpStatus): Responder => {
  function ResponderInner(content?: string | object, headers?: HttpHeaders): HttpError {
    return new HttpError(statusCode, content, headers);
  }

  ResponderInner.code = function (code: number | string) {
    function withCode(content?: string | object, headers?: HttpHeaders): HttpError {
      return new HttpError(statusCode, content, headers).code(code);
    }

    withCode.message = function (message: string) {
      return function (content?: string | object, headers?: HttpHeaders): HttpError {
        return new HttpError(statusCode, content, headers).code(code).message(message);
      };
    };

    return withCode;
  };

  ResponderInner.message = function (message: string) {
    return function (content?: string | object, headers?: HttpHeaders): HttpError {
      return new HttpError(statusCode, content, headers).message(message);
    };
  };

  return ResponderInner;
};

export class HttpResponder {
  static done(status: HttpStatus, content: string | object): HttpResponse {
    return new HttpResponse(status, content);
  }

  static ok(content: string | object): HttpResponse {
    return new HttpResponse(HttpStatus.Ok, content);
  }

  static badRequest = responder(HttpStatus.BadRequest); // 400
  static unauthorized = responder(HttpStatus.Unauthorized); // 401
  static forbidden = responder(HttpStatus.Forbidden); // 403
  static notFound = responder(HttpStatus.NotFound); // 404
  static methodNotAllowed = responder(HttpStatus.MethodNotAllowed); // 405
  static conflict = responder(HttpStatus.Conflict); // 409
  static toManyRequests = responder(HttpStatus.TooManyRequests); // 409
  static internalServerError = responder(HttpStatus.InternalServerError); // 500
  static notImplemented = responder(HttpStatus.NotImplemented); // 501
  static withStatus = (status: HttpStatus): Responder => responder(status); // Any
}
