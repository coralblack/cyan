"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const Http_response_1 = require("./Http.response");
const Http_status_1 = require("./Http.status");
const Logger_1 = require("../core/Logger");
class Controller {
    async beforeHandle(request) { }
    async afterHandle(request, response) {
        return response;
    }
    async onHttpError(request, error) {
        return error;
    }
    async onError(error) {
        Logger_1.Logger.getInstance().error(error);
        return new Http_response_1.Response(Http_status_1.Status.InternalServerError, `An error has occurred. (${error.message})`);
    }
}
exports.Controller = Controller;
//# sourceMappingURL=Http.controller.js.map