"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpHelper = void 0;
const axios_1 = __importDefault(require("axios"));
const Http_method_1 = require("../http/Http.method");
class HttpHelper {
    async request(payload) {
        try {
            if (payload.data && typeof payload.data === "object" && payload.rawData !== true) {
                payload.data = JSON.parse(JSON.stringify(payload.data, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
            }
            if (payload.debug === true) {
                console.debug("> HttpHelper.request, Request", payload);
            }
            const reqResponse = await axios_1.default.request(payload);
            const resp = {};
            resp.body = reqResponse.data;
            resp.status = reqResponse.status;
            resp.statusText = reqResponse.statusText;
            resp.headers = reqResponse.headers;
            resp.request = {
                method: String(reqResponse.config.method).toUpperCase(),
                url: reqResponse.config.url,
                path: reqResponse.request.path,
                headers: reqResponse.config.headers,
            };
            if (payload.debug === true) {
                console.debug("> HttpHelper.request, Succeed Response", {
                    status: resp.status,
                    headers: resp.headers,
                    body: resp.body,
                });
            }
            return resp;
        }
        catch (err) {
            const resp = {};
            if (!(err === null || err === void 0 ? void 0 : err.response)) {
                throw err;
            }
            resp.body = err.response.data;
            resp.status = err.response.status;
            resp.statusText = err.response.statusText;
            resp.headers = err.response.headers;
            resp.errorMessage = err.message;
            resp.request = {
                method: err.config.method,
                url: err.config.url,
                path: err.request.path,
                headers: err.config.headers,
            };
            if (payload.debug === true) {
                console.debug("> HttpHelper.request, Failed Response", {
                    errorMessage: resp.errorMessage,
                    status: resp.status,
                    headers: resp.headers,
                    body: resp.body,
                });
            }
            return resp;
        }
    }
    get(payload) {
        return this.request({ ...payload, method: Http_method_1.HttpMethod.Get });
    }
    post(payload) {
        return this.request({ ...payload, method: Http_method_1.HttpMethod.Post });
    }
    put(payload) {
        return this.request({ ...payload, method: Http_method_1.HttpMethod.Put });
    }
    patch(payload) {
        return this.request({ ...payload, method: Http_method_1.HttpMethod.Patch });
    }
    delete(payload) {
        return this.request({ ...payload, method: Http_method_1.HttpMethod.Delete });
    }
    head(payload) {
        return this.request({ ...payload, method: Http_method_1.HttpMethod.Head });
    }
}
exports.HttpHelper = HttpHelper;
//# sourceMappingURL=Http.helper.js.map