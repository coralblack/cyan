/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { HttpError } from "./Http.error";
import { Request as HttpRequest } from "./Http.request";
import { HttpResponse } from "./Http.response";
import { Status as HttpStatus } from "./Http.status";
import { Logger } from "../core/Logger";

export abstract class Controller {
  async beforeHandle(request: HttpRequest): Promise<void> { }

  async afterHandle(request: HttpRequest, response: any): Promise<HttpResponse> {
    return response;
  }

  async onHttpError(request: HttpRequest, error: HttpError): Promise<HttpError> {
    return error;
  }

  async onError(error: Error): Promise<HttpResponse> {
    Logger.getInstance().error(error);

    return new HttpResponse(HttpStatus.InternalServerError, "An error has occurred.");
  }
}
