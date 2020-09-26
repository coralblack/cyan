"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiController = void 0;
const Http_controller_1 = require("./Http.controller");
const Http_response_1 = require("./Http.response");
const Http_status_1 = require("./Http.status");
class ApiController extends Http_controller_1.Controller {
    async afterHandle(request, response) {
        if (response instanceof Http_response_1.Response) {
            response.content = {
                result: true,
                data: response.content || undefined,
            };
            return response;
        }
        return new Http_response_1.Response(Http_status_1.Status.Ok, {
            result: true,
            data: response || undefined,
        });
    }
    async onHttpError(request, error) {
        error.content = {
            result: false,
            message: typeof error.content === "string" ? error.content : undefined,
            data: typeof error.content === "string" ? undefined : error.content,
        };
        return error;
    }
    async onError(error) {
        const resp = await super.onError(error);
        resp.content = {
            result: false,
            message: error.message,
        };
        return resp;
    }
}
exports.ApiController = ApiController;
//# sourceMappingURL=Http.controller.api.js.map