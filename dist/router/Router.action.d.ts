import { ApiModelOptions, ApiOperationOptions, ApiPropertyOptions, ApiResponseOptions, ApiTagOptions } from "../types/Swagger";
export interface RouteOptions {
}
export declare function Delete(path: string, options?: RouteOptions): MethodDecorator;
export declare function Get(path: string, options?: RouteOptions): MethodDecorator;
export declare function Patch(path: string, options?: RouteOptions): MethodDecorator;
export declare function Post(path: string, options?: RouteOptions): MethodDecorator;
export declare function Put(path: string, options?: RouteOptions): MethodDecorator;
export declare function ApiOperation(options?: ApiOperationOptions): (target: any, propertyKey: string) => void;
export declare function ApiProperty(options?: ApiPropertyOptions): (target: any, propertyKey: string) => void;
export declare function ApiModel(options?: ApiModelOptions): (target: any) => void;
export declare function ApiResponse(statusCode: number, options?: ApiResponseOptions): (target: any, propertyKey: string) => void;
export declare function ApiTags(...tags: ApiTagOptions[]): (target: any) => void;
