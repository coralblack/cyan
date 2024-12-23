import { ApiModelOptions, ApiOperationOptions, ApiPropertyOptions, ApiResponseOptions, ApiTagOptions } from "./Swagger";
export declare function ApiOperation(options?: ApiOperationOptions): (target: any, propertyKey: string) => void;
export declare function ApiProperty(options?: ApiPropertyOptions): (target: any, propertyKey: string) => void;
export declare function ApiModel(options?: ApiModelOptions): (target: any) => void;
export declare function ApiResponse(statusCode: number, options?: ApiResponseOptions): (target: any, propertyKey: string) => void;
export declare function ApiTags(...tags: ApiTagOptions[]): (target: any) => void;
