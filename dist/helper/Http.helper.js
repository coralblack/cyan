"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpHelper = void 0;
const Http_method_1 = require("../http/Http.method");
let axios;
try {
    axios = require("axios").default;
}
catch (e) {
    if (e.message.indexOf("Cannot find module") !== -1) {
        throw Error("Please install the `axios` library to use `HttpHelper` (use `npm install --save axios@0.20`).");
    }
    else {
        throw e;
    }
}
class HttpHelper {
    async request(payload) {
        try {
            if (payload.data && typeof payload.data === "object" && payload.rawData !== true) {
                payload.data = JSON.parse(JSON.stringify(payload.data, (_k, v) => typeof v === "bigint" ? v.toString() : v));
            }
            if (payload.debug === true) {
                console.debug("> HttpHelper.request, Request", payload);
            }
            const e = await axios.request(payload);
            const resp = {};
            resp.body = e.data;
            resp.status = e.status;
            resp.statusText = e.statusText;
            resp.headers = e.headers;
            resp.request = {
                method: String(e.config.method).toUpperCase(),
                url: e.config.url,
                path: e.request.path,
                headers: e.config.headers,
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
        catch (e) {
            const resp = {};
            if (!e.response) {
                throw e;
            }
            resp.body = e.response.data;
            resp.status = e.response.status;
            resp.statusText = e.response.statusText;
            resp.headers = e.response.headers;
            resp.errorMessage = e.message;
            resp.request = {
                method: e.config.method,
                url: e.config.url,
                path: e.request.path,
                headers: e.config.headers,
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
        return this.request(Object.assign(Object.assign({}, payload), { method: Http_method_1.Method.Get }));
    }
    post(payload) {
        return this.request(Object.assign(Object.assign({}, payload), { method: Http_method_1.Method.Post }));
    }
    put(payload) {
        return this.request(Object.assign(Object.assign({}, payload), { method: Http_method_1.Method.Put }));
    }
    patch(payload) {
        return this.request(Object.assign(Object.assign({}, payload), { method: Http_method_1.Method.Patch }));
    }
    delete(payload) {
        return this.request(Object.assign(Object.assign({}, payload), { method: Http_method_1.Method.Delete }));
    }
    head(payload) {
        return this.request(Object.assign(Object.assign({}, payload), { method: Http_method_1.Method.Head }));
    }
}
exports.HttpHelper = HttpHelper;
//# sourceMappingURL=Http.helper.js.map