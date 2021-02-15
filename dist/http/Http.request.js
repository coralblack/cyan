"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequest = void 0;
class HttpRequest {
    constructor(headers, query, params, body) {
        this.headers = headers;
        this.query = query;
        this.params = params;
        this.body = body;
    }
    static getContext(req) {
        return new HttpRequest(req.headers, req.query, req.params, req.body);
    }
}
exports.HttpRequest = HttpRequest;
//# sourceMappingURL=Http.request.js.map