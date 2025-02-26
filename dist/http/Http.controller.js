"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const Http_response_1 = require("./Http.response");
const Http_status_1 = require("./Http.status");
const builtin_1 = require("../util/builtin");
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
    async beforeHandle(request, executionContext) { }
    async afterHandle(request, response, executionContext) {
        return response;
    }
    async onHttpError(request, error) {
        var _a;
        if (!error.content && ((_a = error.additional) === null || _a === void 0 ? void 0 : _a.message)) {
            error.content = error.additional.message;
        }
        return error;
    }
    async onError(error, req, cyan) {
        cyan.logger.error(error, req.httpRequestContext);
        const name = (0, builtin_1.hasOwnProperty)(error, "originalError") ? (0, builtin_1.getConstructorName)(error.originalError) : null;
        const message = `An error has occurred.${name ? ` (${name})` : ""}`;
        return new Http_response_1.HttpResponse(Http_status_1.Status.InternalServerError, message);
    }
}
exports.Controller = Controller;
//# sourceMappingURL=Http.controller.js.map