/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Controller } from "./Http.controller";
import { HttpError } from "./Http.error";
import { Request as HttpRequest } from "./Http.request";
import { Response as HttpResponse } from "./Http.response";
import { Status as HttpStatus } from "./Http.status";

export class ApiController extends Controller {
  // eslint-disable-next-line @typescript-eslint/require-await
  async afterHandle(request: HttpRequest, response: any): Promise<HttpResponse> {
    if (response instanceof HttpResponse) {
      response.content = {
        result: true,
        data: response.content || undefined,
      };

      return response;
    }

    return new HttpResponse(HttpStatus.Ok, {
      result: true,
      data: response || undefined,
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async onHttpError(request: HttpRequest, error: HttpError): Promise<HttpError> {
    error.content = {
      result: false,
      message: typeof error.content === "string" ? error.content : undefined,
      data: typeof error.content === "string" ? undefined : error.content,
    };

    return error;
  }

  async onError(error: Error): Promise<HttpResponse> {
    const resp = await super.onError(error);

    resp.content = {
      result: false,
      message: error.message,
    };

    return resp;
  }
}
