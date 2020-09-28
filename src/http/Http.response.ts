import { HttpError } from "./Http.error";
import { Status as HttpStatus } from "./Http.status";
import { Headers as HttpHeaders } from "../types/Http";

export class HttpResponse {
  public readonly additional: {[key: string]: any} = {};

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

const responser = (statusCode: HttpStatus) => {
  function Responser(content?: string | object, headers?: HttpHeaders): HttpError {
    return new HttpError(statusCode, content, headers);
  }

  Responser.code = function(code: number | string) {
    function withCode(content?: string | object, headers?: HttpHeaders): HttpError {
      return new HttpError(statusCode, content, headers).code(code);
    }
  
    withCode.message = function(message: string) {
      return function(content?: string | object, headers?: HttpHeaders): HttpError {
        return new HttpError(statusCode, content, headers).code(code).message(message);
      };
    };

    return withCode;
  };

  Responser.message = function(message: string) {
    return function(content?: string | object, headers?: HttpHeaders): HttpError {
      return new HttpError(statusCode, content, headers).message(message);
    };
  };

  return Responser;
};

export class Response {
  static done(status: HttpStatus, content: string | object): HttpResponse {
    return new HttpResponse(status, content);
  }

  static ok(content: string | object): HttpResponse {
    return new HttpResponse(HttpStatus.Ok, content);
  }

  static notFound = responser(HttpStatus.NotFound);
  static notImplemented = responser(HttpStatus.NotImplemented);
  static badRequest = responser(HttpStatus.BadRequest);
  static methodNotAllowed = responser(HttpStatus.MethodNotAllowed);
}