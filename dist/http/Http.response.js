"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpResponder = exports.HttpResponse = void 0;
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
class HttpResponder {
    static done(status, content) {
        return new HttpResponse(status, content);
    }
    static ok(content) {
        return new HttpResponse(Http_status_1.Status.Ok, content);
    }
}
exports.HttpResponder = HttpResponder;
HttpResponder.badRequest = responser(Http_status_1.Status.BadRequest);
HttpResponder.unauthorized = responser(Http_status_1.Status.Unauthorized);
HttpResponder.forbidden = responser(Http_status_1.Status.Forbidden);
HttpResponder.notFound = responser(Http_status_1.Status.NotFound);
HttpResponder.methodNotAllowed = responser(Http_status_1.Status.MethodNotAllowed);
HttpResponder.conflict = responser(Http_status_1.Status.Conflict);
HttpResponder.toManyRequests = responser(Http_status_1.Status.TooManyRequests);
HttpResponder.internalServerError = responser(Http_status_1.Status.InternalServerError);
HttpResponder.notImplemented = responser(Http_status_1.Status.NotImplemented);
//# sourceMappingURL=Http.response.js.map