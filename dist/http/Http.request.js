"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequest = void 0;
class HttpRequest {
    constructor(method, url, headers, query, params, body, startTime, remoteAddress, executionContext) {
        this.method = method;
        this.url = url;
        this.headers = headers;
        this.query = query;
        this.params = params;
        this.body = body;
        this.startTime = startTime;
        this.remoteAddress = remoteAddress;
        this.executionContext = executionContext;
    }
    static getContext(req) {
        return new HttpRequest(req.method, req.url, req.headers, req.query, req.params, req.body, req._startTime, req._remoteAddress, req.executionContext || {});
    }
}
exports.HttpRequest = HttpRequest;
//# sourceMappingURL=Http.request.js.map