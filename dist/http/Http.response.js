"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = exports.HttpResponse = void 0;
const Http_error_1 = require("./Http.error");
const Http_status_1 = require("./Http.status");
class HttpResponse {
    constructor(status, content, headers) {
        this.status = status;
        this.content = content;
        this.headers = headers;
        this.additional = {};
    }
    code(val) {
        this.additional.code = val;
        return this;
    }
    message(val) {
        this.additional.message = val;
        return this;
    }
    data(val) {
        this.additional.data = val;
        return this;
    }
    setHeader(name, value) {
        this.headers[name] = value;
    }
    setHeaders(headers) {
        this.headers = Object.assign(this.headers, headers);
    }
}
exports.HttpResponse = HttpResponse;
const responser = (statusCode) => {
    function Responser(content, headers) {
        return new Http_error_1.HttpError(statusCode, content, headers);
    }
    Responser.code = function (code) {
        function withCode(content, headers) {
            return new Http_error_1.HttpError(statusCode, content, headers).code(code);
        }
        withCode.message = function (message) {
            return function (content, headers) {
                return new Http_error_1.HttpError(statusCode, content, headers).code(code).message(message);
            };
        };
        return withCode;
    };
    Responser.message = function (message) {
        return function (content, headers) {
            return new Http_error_1.HttpError(statusCode, content, headers).message(message);
        };
    };
    return Responser;
};
class Response {
    static done(status, content) {
        return new HttpResponse(status, content);
    }
    static ok(content) {
        return new HttpResponse(Http_status_1.Status.Ok, content);
    }
}
exports.Response = Response;
Response.badRequest = responser(Http_status_1.Status.BadRequest);
Response.unauthorized = responser(Http_status_1.Status.Unauthorized);
Response.forbidden = responser(Http_status_1.Status.Forbidden);
Response.notFound = responser(Http_status_1.Status.NotFound);
Response.methodNotAllowed = responser(Http_status_1.Status.MethodNotAllowed);
Response.conflict = responser(Http_status_1.Status.Conflict);
Response.toManyRequests = responser(Http_status_1.Status.TooManyRequests);
Response.notImplemented = responser(Http_status_1.Status.NotImplemented);
//# sourceMappingURL=Http.response.js.map