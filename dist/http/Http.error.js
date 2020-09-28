"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
const Http_status_1 = require("./Http.status");
class HttpError {
    constructor(status, content, headers) {
        this.status = status;
        this.content = content;
        this.headers = headers;
        this.additional = {};
        this.default = `${status} ${Http_status_1.Status[status]}`;
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
}
exports.HttpError = HttpError;
//# sourceMappingURL=Http.error.js.map