"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequest = void 0;
class HttpRequest {
    constructor(headers) {
        this.headers = headers;
    }
    static getContext(request) {
        return new HttpRequest(request.headers);
    }
}
exports.HttpRequest = HttpRequest;
//# sourceMappingURL=Http.request.js.map