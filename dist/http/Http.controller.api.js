"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiController = void 0;
const Http_controller_1 = require("./Http.controller");
const Http_response_1 = require("./Http.response");
const Http_status_1 = require("./Http.status");
const builtin_1 = require("../util/builtin");
class ApiController extends Http_controller_1.Controller {
    async afterHandle(request, response) {
        if (response instanceof Http_response_1.HttpResponse) {
            response.content = {
                result: true,
                data: response.content || undefined,
            };
            return response;
        }
        return new Http_response_1.HttpResponse(Http_status_1.Status.Ok, {
            result: true,
            data: response || undefined,
        });
    }
    async onHttpError(request, error) {
        error.content = Object.assign({ result: false }, error.additional || {}, { data: error.content || undefined });
        return error;
    }
    async onError(error, req, cyan) {
        const resp = await super.onError(error, req, cyan);
        const name = (0, builtin_1.hasOwnProperty)(error, "originalError") ? (0, builtin_1.getConstructorName)(error.originalError) : null;
        const message = `An error has occurred.${name ? ` (${name})` : ""}`;
        resp.content = {
            result: false,
            code: name || error.name || undefined,
            message: (0, builtin_1.hasOwnProperty)(error, "sqlMessage") ? "An error has occurred. (DB Error)" : error.message || message,
        };
        return resp;
    }
}
exports.ApiController = ApiController;
//# sourceMappingURL=Http.controller.api.js.map