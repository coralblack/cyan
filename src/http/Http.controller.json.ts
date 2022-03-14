/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Controller } from "./Http.controller";
import { HttpError } from "./Http.error";
import { HttpRequest as HttpRequest } from "./Http.request";
import { HttpResponse } from "./Http.response";
import { Status as HttpStatus } from "./Http.status";
import { Cyan } from "../core";
import { CyanRequest } from "../types/Handler";
import { getConstructorName, hasOwnProperty } from "../util/builtin";

export class JsonController extends Controller {
  // eslint-disable-next-line @typescript-eslint/require-await
  async afterHandle(request: HttpRequest, response: any): Promise<HttpResponse> {
    if (response instanceof HttpResponse) {
      response.content = typeof response.content === "object" ? response.content : { data: response.content };

      return response;
    }

    return new HttpResponse(HttpStatus.Ok, typeof response === "object" ? response : { data: response });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async onHttpError(request: HttpRequest, error: HttpError): Promise<HttpError> {
    error.content = Object.assign({ result: false }, error.additional || {}, { data: error.content || undefined });

    return error;
  }

  async onError(error: Error, req: CyanRequest, cyan: Cyan): Promise<HttpResponse> {
    const resp = await super.onError(error, req, cyan);

    const name = hasOwnProperty(error, "originalError") ? getConstructorName(error.originalError) : null;
    const message = `An error has occurred.${name ? ` (${name})` : ""}`;

    resp.content = {
      result: false,
      code: name || error.name || undefined,
      message: hasOwnProperty(error, "sqlMessage") ? "An error has occurred. (DB Error)" : error.message || message,
    };

    return resp;
  }
}
