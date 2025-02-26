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
        if (!this.headers)
            this.headers = {};
        this.headers[name] = value;
    }
    setHeaders(headers) {
        this.headers = Object.assign(this.headers || {}, headers);
    }
}
exports.HttpResponse = HttpResponse;
const responder = (statusCode) => {
    function ResponderInner(content, headers) {
        return new Http_error_1.HttpError(statusCode, content, headers);
    }
    ResponderInner.code = function (code) {
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
    ResponderInner.message = function (message) {
        return function (content, headers) {
            return new Http_error_1.HttpError(statusCode, content, headers).message(message);
        };
    };
    return ResponderInner;
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
HttpResponder.badRequest = responder(Http_status_1.Status.BadRequest);
HttpResponder.unauthorized = responder(Http_status_1.Status.Unauthorized);
HttpResponder.forbidden = responder(Http_status_1.Status.Forbidden);
HttpResponder.notFound = responder(Http_status_1.Status.NotFound);
HttpResponder.methodNotAllowed = responder(Http_status_1.Status.MethodNotAllowed);
HttpResponder.conflict = responder(Http_status_1.Status.Conflict);
HttpResponder.toManyRequests = responder(Http_status_1.Status.TooManyRequests);
HttpResponder.internalServerError = responder(Http_status_1.Status.InternalServerError);
HttpResponder.notImplemented = responder(Http_status_1.Status.NotImplemented);
HttpResponder.withStatus = (status) => responder(status);
//# sourceMappingURL=Http.response.js.map