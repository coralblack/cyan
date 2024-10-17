"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTags = exports.ApiResponse = exports.ApiModel = exports.ApiProperty = exports.ApiOperation = exports.Put = exports.Post = exports.Patch = exports.Get = exports.Delete = void 0;
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
function ApiOperation(options = {}) {
    return function (target, propertyKey) {
        Decorator_1.Metadata.getStorage().swaggerOperations.push({
            target: target.constructor,
            method: propertyKey,
            options,
        });
    };
}
exports.ApiOperation = ApiOperation;
function ApiProperty(options = {}) {
    return function (target, propertyKey) {
        Decorator_1.Metadata.getStorage().swaggerProperties.push({
            target: target.constructor,
            propertyKey,
            options,
        });
    };
}
exports.ApiProperty = ApiProperty;
function ApiModel(options = {}) {
    return function (target) {
        Decorator_1.Metadata.getStorage().swaggerModels.push({
            target,
            options,
        });
    };
}
exports.ApiModel = ApiModel;
function ApiResponse(statusCode, options = {}) {
    return function (target, propertyKey) {
        Decorator_1.Metadata.getStorage().swaggerResponses.push({
            target: target.constructor,
            method: propertyKey,
            statusCode,
            options,
        });
    };
}
exports.ApiResponse = ApiResponse;
function ApiTags(...tags) {
    return function (target) {
        Decorator_1.Metadata.getStorage().swaggerControllerTags.push({
            target,
            tags,
        });
    };
}
exports.ApiTags = ApiTags;
//# sourceMappingURL=Router.action.js.map