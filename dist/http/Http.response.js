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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = void 0;
const Http_error_1 = require("./Http.error");
const Http = __importStar(require("."));
class Response {
    constructor(status, content, headers) {
        this.status = status;
        this.content = content;
        this.headers = headers;
    }
    static ok(content) {
        return new Response(Http.Status.Ok, content);
    }
    static notFound(content, headers) {
        return new Http_error_1.HttpError(Http.Status.NotFound, content, headers);
    }
    static notImplemented(content, headers) {
        return new Http_error_1.HttpError(Http.Status.NotImplemented, content, headers);
    }
    static badRequest(content, headers) {
        return new Http_error_1.HttpError(Http.Status.BadRequest, content, headers);
    }
    setHeader(name, value) {
        this.headers[name] = value;
    }
    setHeaders(headers) {
        this.headers = Object.assign(this.headers, headers);
    }
}
exports.Response = Response;
//# sourceMappingURL=Http.response.js.map