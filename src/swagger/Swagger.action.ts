import { ApiModelOptions, ApiOperationOptions, ApiPropertyOptions, ApiResponseOptions, ApiTagOptions } from "./Swagger";
import { Metadata } from "../core/Decorator";

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
