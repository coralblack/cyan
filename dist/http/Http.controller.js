"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const Http_response_1 = require("./Http.response");
const Http_status_1 = require("./Http.status");
const Logger_1 = require("../core/Logger");
class Controller {
    beforeMiddleware(cyan) {
        return (request, response, next) => {
            next();
        };
    }
    afterMiddleware(cyan) {
        return (request, response, next) => {
            next();
        };
    }
    render(cyan) {
        return (request, response, next) => {
            response
                .status(response.processedResponse.status)
                .set(response.processedResponse.headers)
                .send(response.processedResponse.content)
                .end();
        };
    }
    async beforeHandle(request) { }
    async afterHandle(request, response) {
        return response;
    }
    async onHttpError(request, error) {
        var _a;
        if (!error.content && ((_a = error.additional) === null || _a === void 0 ? void 0 : _a.message)) {
            error.content = error.additional.message;
        }
        return error;
    }
    async onError(error) {
        Logger_1.Logger.getInstance().error(error);
        return new Http_response_1.HttpResponse(Http_status_1.Status.InternalServerError, "An error has occurred.");
    }
}
exports.Controller = Controller;
//# sourceMappingURL=Http.controller.js.map