import { Status as HttpStatus } from "./Http.status";
import { Headers as HttpHeaders } from "../types/Http";

export class HttpError {
  public readonly additional: {[key: string]: any} = {};

  constructor(public status: HttpStatus, public content?: string | object, public headers?: HttpHeaders) {
    this.content = ((c) => {
      if (c) return c;
      return `${status} ${HttpStatus[status]}`;
    })(content);
  }

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
}
