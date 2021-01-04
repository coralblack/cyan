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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
const bodyParser = __importStar(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const lodash_1 = require("lodash");
const morgan_1 = __importDefault(require("morgan"));
const Decorator_1 = require("./Decorator");
const Http_error_1 = require("../http/Http.error");
const Http_request_1 = require("../http/Http.request");
const Http_response_1 = require("../http/Http.response");
const Http_status_1 = require("../http/Http.status");
const router_1 = require("../router");
const util_1 = require("../util");
class Handler {
    static beforeHandler(controller) {
        return (req, res, next) => {
            req.httpRequestContext = Http_request_1.HttpRequest.getContext(req);
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
    static paramTransformer(value, type) {
        if (String.prototype === type.prototype) {
            value = type(value);
        }
        else if (Number.prototype === type.prototype) {
            value = type(value);
            if (isNaN(value))
                throw new Error("..");
        }
        else if (BigInt.prototype === type.prototype) {
            value = type(value);
        }
        else if (Boolean.prototype === type.prototype) {
            if (typeof value !== "boolean" && typeof value !== "string" && typeof value !== "number") {
                throw new Error("..");
            }
            else if (typeof value === "number") {
                if (value === 1) {
                    value = true;
                }
                else if (value === 0) {
                    value = false;
                }
                else {
                    throw new Error("..");
                }
            }
            else if (typeof value === "string") {
                if (["true", "1"].includes(value.toLowerCase())) {
                    value = true;
                }
                else if (["false", "0"].includes(value.toLowerCase())) {
                    value = false;
                }
                else {
                    throw new Error("..");
                }
            }
        }
        else if (Date.prototype === type.prototype) {
            value = new type(value);
            if (isNaN(value.getTime()))
                throw new Error("..");
        }
        return value;
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
                if (value || typeof value === "boolean" || typeof value === "number") {
                    if (actionParam.options.type === "ENUM") {
                        const em = actionParam.options.enum;
                        const emKey = Object.keys(em).find(e => em[e] === value);
                        if (!emKey) {
                            if (typeof actionParam.options.invalid === "function") {
                                throw actionParam.options.invalid(value);
                            }
                            else {
                                throw Http_response_1.HttpResponder.badRequest.message(actionParam.options.invalid || `BadRequest (Invalid ${actionParam.type.toString()}: ${actionParam.name})`)();
                            }
                        }
                    }
                    else if (Array.prototype === e.prototype) {
                        if (typeof value === "string") {
                            if (actionParam.options.delimiter) {
                                value = value.split(actionParam.options.delimiter);
                            }
                            else {
                                value = [value];
                            }
                        }
                        if (actionParam.options.type) {
                            value = value.map((v) => this.paramTransformer(v, actionParam.options.type));
                        }
                    }
                    else {
                        value = this.paramTransformer(value, e);
                    }
                    if (actionParam.options.validate) {
                        if (actionParam.options.validate(value) === false) {
                            throw new Error("Validation Failed.");
                        }
                    }
                }
            }
            catch (err) {
                if (err instanceof Http_error_1.HttpError) {
                    throw err;
                }
                else if (typeof actionParam.options.invalid === "function") {
                    throw actionParam.options.invalid(value);
                }
                else {
                    throw Http_response_1.HttpResponder.badRequest.message(actionParam.options.invalid || `BadRequest (Invalid ${actionParam.type.toString()}: ${actionParam.name})`)();
                }
            }
            if (actionParam.options.required && (value === null || typeof value === "undefined" || (typeof value === "string" && value === ""))) {
                if (typeof actionParam.options.missing === "function") {
                    throw actionParam.options.missing();
                }
                else {
                    throw Http_response_1.HttpResponder.badRequest.message(actionParam.options.missing || `BadRequest (Missing ${actionParam.type.toString()}: ${actionParam.name})`)();
                }
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
            if (typeof resp === "function") {
                resp = resp();
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
                .then(resp => {
                if (resp instanceof Http_error_1.HttpError) {
                    next(resp);
                }
                else {
                    if (resp instanceof Http_response_1.HttpResponse) {
                        const headers = resp.headers || {};
                        const response = (r => {
                            if (typeof r === "object") {
                                return JSON.stringify(r, (_, v) => (typeof v === "bigint" ? v.toString() : v));
                            }
                            else if (r)
                                return r;
                            else
                                return "No Content";
                        })(resp.content);
                        if (typeof resp.content === "object") {
                            headers["content-type"] = headers["content-type"] || "application/json";
                        }
                        res.processedResponse = {
                            status: resp.status,
                            headers,
                            content: response,
                        };
                        next();
                        return;
                    }
                    res.processedResponse = {
                        status: 200,
                        headers: {},
                        content: resp,
                    };
                    next();
                }
            })
                .catch((err) => {
                next(err);
            });
        };
    }
    static errorHandler(controller) {
        return (err, req, res, next) => {
            if (err instanceof Http_response_1.HttpResponse || err instanceof Http_error_1.HttpError) {
                next(err);
                return;
            }
            res.finalized = true;
            controller
                .onError(err)
                .then(errResp => {
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
                .then(resp => {
                next(resp);
            })
                .catch((err) => {
                next(err);
            });
        };
    }
    static accessLogger(name) {
        return morgan_1.default((tokens, req, res) => [
            `${util_1.datetime(",")}`,
            `${name},`,
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, "content-length"),
            "-",
            tokens["response-time"](req, res),
            "ms",
        ].join(" "));
    }
    static jsonBodyParser(options) {
        const jsonParser = bodyParser.json(options);
        return (req, res, next) => {
            jsonParser(req, res, err => {
                if (err) {
                    const respErr = new Http_error_1.HttpError(Http_status_1.Status.BadRequest, "The specified json body is invalid.");
                    next(respErr);
                    return;
                }
                next();
            });
        };
    }
    static urlEncodedBodyParser(options) {
        return bodyParser.urlencoded(options || { extended: true });
    }
    static corsHandler(options) {
        return cors_1.default(options);
    }
}
exports.Handler = Handler;
Handler.symActionParams = Symbol();
//# sourceMappingURL=Handler.js.map