"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonController = void 0;
const Http_controller_1 = require("./Http.controller");
const Http_response_1 = require("./Http.response");
const Http_status_1 = require("./Http.status");
class JsonController extends Http_controller_1.Controller {
    async afterHandle(request, response) {
        if (response instanceof Http_response_1.HttpResponse) {
            response.content = typeof response.content === "object" ? response.content : { data: response.content };
            return response;
        }
        return new Http_response_1.HttpResponse(Http_status_1.Status.Ok, typeof response === "object" ? response : { data: response });
    }
    async onHttpError(request, error) {
        error.content = Object.assign({ result: false }, error.additional || {}, { data: error.content || undefined });
        return error;
    }
    async onError(error) {
        const resp = await super.onError(error);
        resp.content = {
            result: false,
            code: error.name || undefined,
            message: error.message,
        };
        return resp;
    }
}
exports.JsonController = JsonController;
//# sourceMappingURL=Http.controller.json.js.map