/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Handler as ExpressHandler, Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import { HttpError } from "./Http.error";
import { HttpRequest as HttpRequest } from "./Http.request";
import { HttpResponse } from "./Http.response";
import { Status as HttpStatus } from "./Http.status";
import { Cyan } from "../core";
import { ExtendedError } from "../core/Error";
import { CyanRequest } from "../types/Handler";
import { getConstructorName, hasOwnProperty } from "../util/builtin";

export interface ProcessedExpressResponse extends ExpressResponse {
  processedResponse: {
    status: number;
    headers: any;
    content: any;
  };
}

export abstract class Controller {
  beforeMiddleware(cyan: Cyan): ExpressHandler {
    return (request: ExpressRequest, response: ExpressResponse, next: NextFunction) => {
      next();
    };
  }

  afterMiddleware(cyan: Cyan): ExpressHandler {
    return (request: ExpressRequest, response: ExpressResponse, next: NextFunction) => {
      next();
    };
  }

  render(cyan: Cyan): ExpressHandler {
    return (request: ExpressRequest, response: ProcessedExpressResponse, next: NextFunction) => {
      response
        .status(response.processedResponse.status)
        .set(response.processedResponse.headers)
        .send(response.processedResponse.content)
        .end();
    };
  }

  async beforeHandle(request: HttpRequest): Promise<void> {}

  async afterHandle(request: HttpRequest, response: any): Promise<HttpResponse> {
    return response;
  }

  async onHttpError(request: HttpRequest, error: HttpError): Promise<HttpError> {
    if (!error.content && error.additional?.message) {
      error.content = error.additional.message;
    }

    return error;
  }

  async onError(error: Error | ExtendedError, req: CyanRequest, cyan: Cyan): Promise<HttpResponse> {
    cyan.logger.error(error, req.httpRequestContext);

    const name = hasOwnProperty(error, "originalError") ? getConstructorName(error.originalError) : null;
    const message = `An error has occurred.${name ? ` (${name})` : ""}`;

    return new HttpResponse(HttpStatus.InternalServerError, message);
  }
}
