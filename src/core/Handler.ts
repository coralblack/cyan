/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */

import * as bodyParser from "body-parser";
import { NextFunction } from "express";
import { get } from "lodash";
import { RouteMetadataArgs, RouteParamMetadataArgs } from "src/types/MetadataArgs";
import { Metadata } from "./Decorator";
import { Controller as HttpController } from "../http/Http.controller";
import { HttpError } from "../http/Http.error";
import { Request as HttpRequest } from "../http/Http.request";
import { Response as HttpResponse } from "../http/Http.response";
import { Status as HttpStatus } from "../http/Http.status";
import { ParamType } from "../router";
import { CyanRequest, CyanResponse, ErrorHandlerFunction, HandlerFunction } from "../types/Handler";

export class Handler {
  public static jsonBodyParser(): HandlerFunction {
    const jsonParser = bodyParser.json();

    return (req: CyanRequest, res: CyanResponse, next: NextFunction) => {
      jsonParser(req as any, res as any, (err) => { // eslint-disable-line consistent-return
        if (err) {
          const respErr = new HttpError(HttpStatus.BadRequest, "The specified json body is invalid.");

          next(respErr);
          return;
        }

        next();
      });
    };
  }

  public static beforeHandler(controller: HttpController): HandlerFunction {
    return (req: CyanRequest, res: CyanResponse, next: NextFunction) => {
      req.httpRequestContext = HttpRequest.getContext(req);
      controller
        .beforeHandle(req.httpRequestContext)
        .then(() => {
          next();
        })
        .catch((err: Error) => {
          next(err);
        });
    };
  }

  private static symActionParams = Symbol();

  public static getActionParams(req: CyanRequest, route: RouteMetadataArgs, actionParams: RouteParamMetadataArgs[]): any[] {
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

  public static actionHandler(controller: HttpController, route: RouteMetadataArgs): HandlerFunction {
    return async (req: CyanRequest, res: CyanResponse, next: NextFunction) => {
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
        res.preparedResponse = resp;
        next();
      }
    };
  }

  public static afterHandler(controller: HttpController): HandlerFunction {
    return (req: CyanRequest, res: CyanResponse, next: NextFunction) => {
      controller
        .afterHandle(req.httpRequestContext, res.preparedResponse)
        .then((resp) => {
          if (resp instanceof HttpError) {
            next(resp);
          } else {
            if (resp instanceof HttpResponse) {
              const headers = resp.headers || {};
              const response = ((r) => {
                if (typeof r === "object") {
                  return JSON.stringify(r, (_, v) => typeof v === "bigint" ? v.toString() : v);
                }
                else if (r) return r;
                else return "No Content";
              })(resp.content);

              if (typeof resp.content === "object") {
                headers["content-type"] = headers["content-type"] || "application/json";
              }

              res
                .status(resp.status)
                .set(headers)
                .send(response)
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

  public static errorHandler(controller: HttpController): ErrorHandlerFunction {
    return (err: Error, req: CyanRequest, res: CyanResponse, next: NextFunction) => {
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

  public static httpErrorHandler(controller: HttpController): ErrorHandlerFunction {
    return (err: HttpError, req: CyanRequest, res: CyanResponse, next: NextFunction) => {
      if (res.finalized) {
        next(err);
        return;
      }

      controller
        .onHttpError(req.httpRequestContext, err)
        .then((resp) => {
          next(resp);
        })
        .catch((err: Error) => {
          next(err);
        });
    };
  }
}
