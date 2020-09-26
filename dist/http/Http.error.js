"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
const Http_status_1 = require("./Http.status");
class HttpError extends Error {
    constructor(status, content, headers) {
        super(`${status} [${Http_status_1.Status[status]}]`);
        this.status = status;
        this.content = content;
        this.headers = headers;
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=Http.error.js.map