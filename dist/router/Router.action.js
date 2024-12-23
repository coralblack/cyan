"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Put = exports.Post = exports.Patch = exports.Get = exports.Delete = void 0;
const Decorator_1 = require("../core/Decorator");
const Http_method_1 = require("../http/Http.method");
function Route(action, path, options) {
    return function RouteInner(target, method) {
        const params = Reflect.getMetadata("design:paramtypes", target, method);
        Decorator_1.Metadata.getStorage().routes.push({
            target: target.constructor,
            method,
            action,
            path,
            params,
            options,
        });
    };
}
function Delete(path, options) {
    return Route(Http_method_1.HttpMethod.Delete, path, options || {});
}
exports.Delete = Delete;
function Get(path, options) {
    return Route(Http_method_1.HttpMethod.Get, path, options || {});
}
exports.Get = Get;
function Patch(path, options) {
    return Route(Http_method_1.HttpMethod.Patch, path, options || {});
}
exports.Patch = Patch;
function Post(path, options) {
    return Route(Http_method_1.HttpMethod.Post, path, options || {});
}
exports.Post = Post;
function Put(path, options) {
    return Route(Http_method_1.HttpMethod.Put, path, options || {});
}
exports.Put = Put;
//# sourceMappingURL=Router.action.js.map