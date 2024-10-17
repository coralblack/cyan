import { Metadata } from "../core/Decorator";
import { HttpMethod } from "../http/Http.method";
import { ApiModelOptions, ApiOperationOptions, ApiPropertyOptions, ApiResponseOptions, ApiTagOptions } from "../types/Swagger";

export interface RouteOptions {}

function Route(action: HttpMethod, path: string, options: RouteOptions): MethodDecorator {
  return function RouteInner(target: any, method: string) {
    const params = Reflect.getMetadata("design:paramtypes", target, method);

    Metadata.getStorage().routes.push({
      target: target.constructor,
      method,
      action,
      path,
      params,
      options,
    });
  };
}

export function Delete(path: string, options?: RouteOptions): MethodDecorator {
  return Route(HttpMethod.Delete, path, options || {});
}

export function Get(path: string, options?: RouteOptions): MethodDecorator {
  return Route(HttpMethod.Get, path, options || {});
}

export function Patch(path: string, options?: RouteOptions): MethodDecorator {
  return Route(HttpMethod.Patch, path, options || {});
}

export function Post(path: string, options?: RouteOptions): MethodDecorator {
  return Route(HttpMethod.Post, path, options || {});
}

export function Put(path: string, options?: RouteOptions): MethodDecorator {
  return Route(HttpMethod.Put, path, options || {});
}

// Swagger
export function ApiOperation(options: ApiOperationOptions = {}) {
  return function (target: any, propertyKey: string) {
    Metadata.getStorage().swaggerOperations.push({
      target: target.constructor,
      method: propertyKey,
      options,
    });
  };
}

export function ApiProperty(options: ApiPropertyOptions = {}) {
  return function (target: any, propertyKey: string) {
    Metadata.getStorage().swaggerProperties.push({
      target: target.constructor,
      propertyKey,
      options,
    });
  };
}

export function ApiModel(options: ApiModelOptions = {}) {
  return function (target: any) {
    Metadata.getStorage().swaggerModels.push({
      target,
      options,
    });
  };
}

export function ApiResponse(statusCode: number, options: ApiResponseOptions = {}) {
  return function (target: any, propertyKey: string) {
    Metadata.getStorage().swaggerResponses.push({
      target: target.constructor,
      method: propertyKey,
      statusCode,
      options,
    });
  };
}

export function ApiTags(...tags: ApiTagOptions[]) {
  return function (target: any) {
    Metadata.getStorage().swaggerControllerTags.push({
      target,
      tags,
    });
  };
}
