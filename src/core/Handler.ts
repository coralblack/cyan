/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as bodyParser from "body-parser";
import cors, { CorsOptions, CorsOptionsDelegate } from "cors";
import { NextFunction } from "express";
import { get } from "lodash";
import morgan from "morgan";
import { Metadata } from "./Decorator";
import { ExtendedError } from "./Error";
import { hasOwnProperty } from "..//util/builtin";
import { Controller as HttpController, ProcessedExpressResponse } from "../http/Http.controller";
import { HttpError } from "../http/Http.error";
import { HttpRequest as HttpRequest } from "../http/Http.request";
import { HttpResponder, HttpResponse } from "../http/Http.response";
import { Status as HttpStatus } from "../http/Http.status";
import { ParamOptions, ParamType } from "../router";
import { CyanRequest, CyanResponse, ErrorHandlerFunction, HandlerFunction } from "../types/Handler";
import { RouteMetadataArgs, RouteParamMetadataArgs } from "../types/MetadataArgs";
import { datetime } from "../util";
import { Cyan } from ".";

export class Handler {
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

  private static paramTransformer(value: any, type: any): any {
    if (String.prototype === type.prototype) {
      value = type(value);
    } else if (Number.prototype === type.prototype) {
      if (RegExp(/\s/).test(value)) throw new Error("..");

      value = type(value);

      if (isNaN(value)) throw new Error("..");
    } else if (BigInt.prototype === type.prototype) {
      value = type(value);
    } else if (Boolean.prototype === type.prototype) {
      if (typeof value !== "boolean" && typeof value !== "string" && typeof value !== "number") {
        throw new Error("..");
      } else if (typeof value === "number") {
        if (value === 1) {
          value = true;
        } else if (value === 0) {
          value = false;
        } else {
          throw new Error("..");
        }
      } else if (typeof value === "string") {
        if (["true", "1"].includes(value.toLowerCase())) {
          value = true;
        } else if (["false", "0"].includes(value.toLowerCase())) {
          value = false;
        } else {
          throw new Error("..");
        }
      }
    } else if (Date.prototype === type.prototype) {
      value = new type(value);
      if (isNaN(value.getTime())) throw new Error("..");
    }

    return value;
  }

  public static getActionParams(req: CyanRequest, route: RouteMetadataArgs, actionParams: RouteParamMetadataArgs[]): any[] {
    return (route.params || []).map((e, i) => {
      const actionParamFound: RouteParamMetadataArgs = actionParams.find(ap => ap.index === i);
      let actionParam: RouteParamMetadataArgs<ParamOptions> = null;

      if (!actionParamFound) return undefined;
      if (hasOwnProperty(actionParamFound.options, "type") && actionParamFound.options.type === "REQ") {
        const { httpRequestContext } = req;

        return httpRequestContext[actionParamFound.options.attr];
      } else {
        actionParam = (actionParamFound as unknown) as RouteParamMetadataArgs<ParamOptions>;
      }

      let value = ((type: ParamType, name: string) => {
        if (type === ParamType.Query) return req.query[name];
        if (type === ParamType.Path) return req.params[name];
        if (type === ParamType.Header) return req.headers[name];
        if (type === ParamType.Body) return get(req.body, name); // eslint-disable-line @typescript-eslint/no-unsafe-return
      })(actionParam.type, actionParam.name);

      try {
        if (value || typeof value === "boolean" || typeof value === "number") {
          if (actionParam.options.type === "ENUM") {
            const em = actionParam.options.enum;
            const check = (iterVal: any) => {
              const emKey = Object.keys(em).find(e => {
                if (actionParam.type === ParamType.Query) return String(em[e]) === String(iterVal);
                return em[e] === iterVal;
              });

              if (!emKey) {
                let invalid: any = actionParam.options.invalid;

                if (typeof invalid === "function") {
                  invalid = invalid(iterVal);
                }

                throw invalid instanceof HttpError
                  ? invalid
                  : HttpResponder.badRequest.message(
                      invalid || `BadRequest (Invalid ${actionParam.type.toString()}: ${actionParam.name})`
                    )();
              }
            };

            if (typeof value === "string") {
              if (actionParam.options.delimiter) {
                value = value.split(actionParam.options.delimiter);
              }
            }

            if (actionParam.options.array === true) {
              value = Array.isArray(value) ? value : [value];

              for (const iterVal of value) {
                check(iterVal);
              }

              if (actionParam.options.required && !value.length) {
                value = null;
              }
            } else {
              check(value);
            }
          } else if (Array.prototype === e.prototype) {
            if (typeof value === "string") {
              if (actionParam.options.delimiter) {
                value = value.split(actionParam.options.delimiter);
              } else {
                value = [value];
              }
            }

            if (actionParam.options.type) {
              value = value.map((v: any) => this.paramTransformer(v, actionParam.options.type));
            }
          } else {
            value = this.paramTransformer(value, e);
          }

          if (actionParam.options.validate) {
            if (actionParam.options.validate(value) === false) {
              throw new Error("Validation Failed.");
            }
          }
        }
      } catch (err) {
        if (err instanceof HttpError) {
          throw err;
        } else if (typeof actionParam.options.invalid === "function") {
          let invalid: any = actionParam.options.invalid;

          if (typeof invalid === "function") {
            invalid = invalid(value);
          }

          throw invalid instanceof HttpError
            ? invalid
            : HttpResponder.badRequest.message(invalid || `BadRequest (Invalid ${actionParam.type.toString()}: ${actionParam.name})`)();
        } else {
          throw HttpResponder.badRequest.message(
            actionParam.options.invalid || `BadRequest (Invalid ${actionParam.type.toString()}: ${actionParam.name})`
          )();
        }
      }

      if (hasOwnProperty(actionParam.options, "default") && value === undefined) {
        value = actionParam.options.default;
      }

      if (actionParam.options.required && (value === null || typeof value === "undefined" || (typeof value === "string" && value === ""))) {
        if (typeof actionParam.options.missing === "function") {
          throw actionParam.options.missing();
        } else {
          throw HttpResponder.badRequest.message(
            actionParam.options.missing || `BadRequest (Missing ${actionParam.type.toString()}: ${actionParam.name})`
          )();
        }
      }

      return value;
    });
  }

  public static actionHandler(controller: HttpController, route: RouteMetadataArgs): HandlerFunction {
    return async (req: CyanRequest, res: CyanResponse, next: NextFunction) => {
      let resp: any;
      let thrown = false;

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
        thrown = true;
        resp = err;
      }

      if (typeof resp === "function") {
        try {
          resp = await resp();
        } catch (err) {
          thrown = true;
          resp = err;
        }
      }

      if (resp instanceof Error || resp instanceof HttpError || thrown) {
        if (resp instanceof Error || resp instanceof HttpError) {
          next(resp);
        } else {
          const name = hasOwnProperty(resp, "name") ? resp.name : "Unknown";

          next(new ExtendedError(hasOwnProperty(resp, "message") ? resp.message : `An error has occurred. (${name})`, resp));
        }
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
        .then(resp => {
          if (resp instanceof HttpError) {
            next(resp);
          } else {
            if (resp instanceof HttpResponse) {
              const headers = resp.headers || {};
              const response = (r => {
                if (typeof r === "object") {
                  return JSON.stringify(r, (_, v) => (typeof v === "bigint" ? v.toString() : v));
                } else if (r) return r;
                else return "No Content";
              })(resp.content);

              if (typeof resp.content === "object") {
                headers["content-type"] = headers["content-type"] || "application/json";
              }

              ((res as unknown) as ProcessedExpressResponse).processedResponse = {
                status: resp.status,
                headers,
                content: response,
              };
              next();
              return;
            }

            ((res as unknown) as ProcessedExpressResponse).processedResponse = {
              status: 200,
              headers: {},
              content: resp,
            };
            next();
          }
        })
        .catch((err: Error) => {
          next(err);
        });
    };
  }

  public static errorHandler(controller: HttpController, cyan: Cyan): ErrorHandlerFunction {
    return (err: Error, req: CyanRequest, res: CyanResponse, next: NextFunction) => {
      if (err instanceof HttpResponse || err instanceof HttpError) {
        next(err);
        return;
      }

      res.finalized = true;

      controller
        .onError(err, req, cyan)
        .then(errResp => {
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
        .then(resp => {
          next(resp);
        })
        .catch((err: Error) => {
          next(err);
        });
    };
  }

  public static accessLogger(name: string): HandlerFunction {
    return (morgan((tokens, req, res): any =>
      [
        `${datetime(",")}`,
        `${name},`,
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
      ].join(" ")
    ) as unknown) as HandlerFunction;
  }

  public static jsonBodyParser(options?: bodyParser.OptionsJson): HandlerFunction {
    const jsonParser = bodyParser.json(options);

    return (req: CyanRequest, res: CyanResponse, next: NextFunction) => {
      jsonParser(req as any, res as any, err => {
        // eslint-disable-line consistent-return
        if (err) {
          const respErr = new HttpError(HttpStatus.BadRequest, "The specified json body is invalid.");

          next(respErr);
          return;
        }

        next();
      });
    };
  }

  public static urlEncodedBodyParser(options?: bodyParser.OptionsUrlencoded): HandlerFunction {
    return (bodyParser.urlencoded(options || { extended: true }) as unknown) as HandlerFunction;
  }

  public static corsHandler(options?: CorsOptions | CorsOptionsDelegate): HandlerFunction {
    return (cors(options) as unknown) as HandlerFunction;
  }
}
