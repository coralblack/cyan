import { Status as HttpStatus } from "./Http.status";
import { Headers as HttpHeaders } from "../types/Http";

export class HttpError extends Error {
  constructor(public status: HttpStatus, public content?: string | object, public headers?: HttpHeaders) {
    super(`${status} [${HttpStatus[status]}]`);
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
