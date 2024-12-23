"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTags = exports.ApiResponse = exports.ApiModel = exports.ApiProperty = exports.ApiOperation = void 0;
const Decorator_1 = require("../core/Decorator");
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
//# sourceMappingURL=Swagger.action.js.map