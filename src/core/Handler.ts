/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */

import * as bodyParser from "body-parser";
import { ErrorRequestHandler, Handler as ExpressHandler, Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import { get } from "lodash";
import { RouteMetadataArgs, RouteParamMetadataArgs } from "src/types/MetadataArgs";
import { Metadata } from "./Decorator";
import { Controller as HttpController } from "../http/Http.controller";
import { HttpError } from "../http/Http.error";
import { Request as HttpRequest } from "../http/Http.request";
import { Response as HttpResponse } from "../http/Http.response";
import { Status as HttpStatus } from "../http/Http.status";
import { ParamType } from "../router";

interface HandledRequest extends ExpressRequest {
  handledRequest: HttpRequest;
}

interface HandledResponse extends ExpressResponse {
  handledResponse: any;
  finalized: boolean;
}

export class Handler {
  public static jsonBodyParser(): ExpressHandler {
    const jsonParser = bodyParser.json();

    return (req: HandledRequest, res: ExpressResponse, next: NextFunction) => {
      jsonParser(req, res, (err) => { // eslint-disable-line consistent-return
        if (err) {
          const respErr = new HttpError(HttpStatus.BadRequest, "The specified json body is invalid.");

          next(respErr);
          return;
        }

        next();
      });
    };
  }

  public static beforeHandler(controller: HttpController): ExpressHandler {
    return (req: HandledRequest, res: ExpressResponse, next: NextFunction) => {
      req.handledRequest = HttpRequest.getContext(req);
      controller
        .beforeHandle(req.handledRequest)
        .then(() => {
          next();
        })
        .catch((err: Error) => {
          next(err);
        });
    };
  }

  private static symActionParams = Symbol();

  public static getActionParams(req: HandledRequest, route: RouteMetadataArgs, actionParams: RouteParamMetadataArgs[]): any[] {
    return (route.params || []).map((e, i) => {
      const actionParam = actionParams.find(ap => ap.index === i);

      if (!actionParam) return undefined;

      let value = ((type: ParamType, name: string) => {
        if (type === ParamType.Query) return req.query[name];
        if (type === ParamType.Path) return req.params[name];
        if (type === ParamType.Header) return req.headers[name];
        if (type === ParamType.Body) return get(req.body, name); // eslint-disable-line @typescript-eslint/no-unsafe-return
      })(actionParam.type, actionParam.name);

      try {
        value = value && e(value);

        if (e.name === Number.name && isNaN(value)) throw new Error("..");
      } catch (err) {
        throw new HttpError(HttpStatus.BadRequest, `BadRequest (Invalid ${actionParam.type.toString()}: ${actionParam.name})`);
      }

      if (actionParam.options.required && !value) {
        throw new HttpError(HttpStatus.BadRequest, `BadRequest (Missing ${actionParam.type.toString()}: ${actionParam.name})`);
      }

      return value;
    });
  }

  public static actionHandler(controller: HttpController, route: RouteMetadataArgs): ExpressHandler {
    return async (req: HandledRequest, res: HandledResponse, next: NextFunction) => {
      let resp: any;
      
      const actionParams: RouteParamMetadataArgs[] = (() => {
        if (controller[this.symActionParams] && controller[this.symActionParams][route.method]) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return controller[this.symActionParams][route.method];
        }
        
        const aps = Metadata.getStorage().routeParams.filter(rp => rp.target === route.target && rp.method === route.method);

        controller[this.symActionParams] = controller[this.symActionParams] || {};
        controller[this.symActionParams][route.method] = aps;

        return aps;
      })();

      try {
        const params = this.getActionParams(req, route, actionParams);

        resp = await controller[route.method](...params);
      } catch (err) {
        resp = err;
      }

      if (resp instanceof Error || resp instanceof HttpError) {
        next(resp);
      } else {
        res.handledResponse = resp;
        next();
      }
    };
  }

  public static afterHandler(controller: HttpController): ExpressHandler {
    return (req: HandledRequest, res: HandledResponse, next: NextFunction) => {
      controller
        .afterHandle(req.handledRequest, res.handledResponse)
        .then((resp) => {
          if (resp instanceof HttpError) {
            next(resp);
          } else {
            if (resp instanceof HttpResponse) {
              res
                .status(resp.status)
                .set(resp.headers || {})
                .send(resp.content || "No Content")
                .end();
              return;
            }

            res.status(200).send(resp).end();
          }
        })
        .catch((err: Error) => {
          next(err);
        });
    };
  }

  public static errorHandler(controller: HttpController): ErrorRequestHandler {
    return (err: Error, req: HandledRequest, res: HandledResponse, next: NextFunction) => {
      if (err instanceof HttpResponse || err instanceof HttpError) {
        next(err);
        return;
      }

      res.finalized = true;

      controller
        .onError(err)
        .then((errResp) => {
          next(errResp);
        })
        .catch((err: Error) => {
          next(err);
        });
    };
  }

  public static httpErrorHandler(controller: HttpController): ErrorRequestHandler {
    return (err: HttpError, req: HandledRequest, res: HandledResponse, next: NextFunction) => {
      if (res.finalized) {
        next(err);
        return;
      }

      controller
        .onHttpError(req.handledRequest, err)
        .then((resp) => {
          next(resp);
        })
        .catch((err: Error) => {
          next(err);
        });
    };
  }
}
