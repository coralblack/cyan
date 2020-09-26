"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
class Request {
    constructor(headers) {
        this.headers = headers;
    }
    static getContext(request) {
        return new Request(request.headers);
    }
}
exports.Request = Request;
//# sourceMappingURL=Http.request.js.map