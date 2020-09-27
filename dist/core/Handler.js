"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
const bodyParser = __importStar(require("body-parser"));
const lodash_1 = require("lodash");
const Decorator_1 = require("./Decorator");
const Http_error_1 = require("../http/Http.error");
const Http_request_1 = require("../http/Http.request");
const Http_response_1 = require("../http/Http.response");
const Http_status_1 = require("../http/Http.status");
const router_1 = require("../router");
class Handler {
    static jsonBodyParser() {
        const jsonParser = bodyParser.json();
        return (req, res, next) => {
            jsonParser(req, res, (err) => {
                if (err) {
                    const respErr = new Http_error_1.HttpError(Http_status_1.Status.BadRequest, "The specified json body is invalid.");
                    next(respErr);
                    return;
                }
                next();
            });
        };
    }
    static beforeHandler(controller) {
        return (req, res, next) => {
            req.httpRequestContext = Http_request_1.Request.getContext(req);
            controller
                .beforeHandle(req.httpRequestContext)
                .then(() => {
                next();
            })
                .catch((err) => {
                next(err);
            });
        };
    }
    static getActionParams(req, route, actionParams) {
        return (route.params || []).map((e, i) => {
            const actionParam = actionParams.find(ap => ap.index === i);
            if (!actionParam)
                return undefined;
            let value = ((type, name) => {
                if (type === router_1.ParamType.Query)
                    return req.query[name];
                if (type === router_1.ParamType.Path)
                    return req.params[name];
                if (type === router_1.ParamType.Header)
                    return req.headers[name];
                if (type === router_1.ParamType.Body)
                    return lodash_1.get(req.body, name);
            })(actionParam.type, actionParam.name);
            try {
                value = value && e(value);
                if (e.name === Number.name && isNaN(value))
                    throw new Error("..");
            }
            catch (err) {
                throw new Http_error_1.HttpError(Http_status_1.Status.BadRequest, `BadRequest (Invalid ${actionParam.type.toString()}: ${actionParam.name})`);
            }
            if (actionParam.options.required && !value) {
                throw new Http_error_1.HttpError(Http_status_1.Status.BadRequest, `BadRequest (Missing ${actionParam.type.toString()}: ${actionParam.name})`);
            }
            return value;
        });
    }
    static actionHandler(controller, route) {
        return async (req, res, next) => {
            let resp;
            const actionParams = (() => {
                if (controller[this.symActionParams] && controller[this.symActionParams][route.method]) {
                    return controller[this.symActionParams][route.method];
                }
                const aps = Decorator_1.Metadata.getStorage().routeParams.filter(rp => rp.target === route.target && rp.method === route.method);
                controller[this.symActionParams] = controller[this.symActionParams] || {};
                controller[this.symActionParams][route.method] = aps;
                return aps;
            })();
            try {
                const params = this.getActionParams(req, route, actionParams);
                resp = await controller[route.method](...params);
            }
            catch (err) {
                resp = err;
            }
            if (resp instanceof Error || resp instanceof Http_error_1.HttpError) {
                next(resp);
            }
            else {
                res.preparedResponse = resp;
                next();
            }
        };
    }
    static afterHandler(controller) {
        return (req, res, next) => {
            controller
                .afterHandle(req.httpRequestContext, res.preparedResponse)
                .then((resp) => {
                if (resp instanceof Http_error_1.HttpError) {
                    next(resp);
                }
                else {
                    if (resp instanceof Http_response_1.Response) {
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
                .catch((err) => {
                next(err);
            });
        };
    }
    static errorHandler(controller) {
        return (err, req, res, next) => {
            if (err instanceof Http_response_1.Response || err instanceof Http_error_1.HttpError) {
                next(err);
                return;
            }
            res.finalized = true;
            controller
                .onError(err)
                .then((errResp) => {
                next(errResp);
            })
                .catch((err) => {
                next(err);
            });
        };
    }
    static httpErrorHandler(controller) {
        return (err, req, res, next) => {
            if (res.finalized) {
                next(err);
                return;
            }
            controller
                .onHttpError(req.httpRequestContext, err)
                .then((resp) => {
                next(resp);
            })
                .catch((err) => {
                next(err);
            });
        };
    }
}
exports.Handler = Handler;
Handler.symActionParams = Symbol();
//# sourceMappingURL=Handler.js.map