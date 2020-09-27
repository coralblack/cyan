"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Middleware = exports.MIDDLEWARE_PRIORITY_AFTER_HANDLER = exports.MIDDLEWARE_PRIORITY_ACTION_HANDLER = exports.MIDDLEWARE_PRIORITY_BEFORE_HANDLER = void 0;
const Decorator_1 = require("../core/Decorator");
exports.MIDDLEWARE_PRIORITY_BEFORE_HANDLER = 10000;
exports.MIDDLEWARE_PRIORITY_ACTION_HANDLER = 20000;
exports.MIDDLEWARE_PRIORITY_AFTER_HANDLER = 30000;
function Middleware(handler, options) {
    return function MiddlewareInner(target, method, descriptor) {
        Decorator_1.Metadata.getStorage().middlewares.push({
            target: target.constructor,
            method,
            handler,
            options: Object.assign({ priority: 15000 }, options),
        });
    };
}
exports.Middleware = Middleware;
//# sourceMappingURL=Router.middleware.js.map