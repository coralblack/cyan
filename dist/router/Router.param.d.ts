import { HttpRequest } from "../http";
import { HttpError } from "../http/Http.error";
import { ClassType } from "../types";
export interface ParamBaseOptions<T = string | number | boolean | object> {
    required?: boolean;
    default?: any;
    invalid?: string | ((v: T) => HttpError | string);
    missing?: string | (() => HttpError | string);
    delimiter?: string;
    validate?: (v: T) => boolean | void;
}
export interface ContextParamAttributes {
}
export interface ParamClassOptions extends ParamBaseOptions {
    type?: ClassType<any> | BigIntConstructor;
}
export interface ParamEnumOptions<T extends {
    [key: string]: string | number;
}> extends ParamBaseOptions {
    type: "ENUM";
    enum: T;
    array?: boolean;
}
export type ParamOptions<T extends {
    [key: string]: string | number;
} = any> = ParamClassOptions | ParamEnumOptions<T>;
export declare enum ParamType {
    Query = "QUERY",
    Header = "HEADER",
    Body = "BODY",
    Path = "PATH",
    System = "SYSTEM",
    Context = "CONTEXT"
}
export type SystemParamOptions = SystemRequestParamOptions;
export interface SystemRequestParamOptions {
    type: "REQ";
    attr: keyof HttpRequest;
}
export type ContextParamOptions = CyanRequestContextParamOptions;
export interface CyanRequestContextParamOptions {
    type: "CONTEXT";
    attr: keyof ContextParamAttributes;
    validate?: (v: any) => boolean;
}
export declare function HeaderParam(name: string, options?: ParamOptions): ParameterDecorator;
export declare function BodyParam(name: string, options?: ParamOptions): ParameterDecorator;
export declare function PathParam(name: string, options?: ParamOptions): ParameterDecorator;
export declare function QueryParam(name: string, options?: ParamOptions): ParameterDecorator;
export declare function SystemParam(options: SystemParamOptions): ParameterDecorator;
export declare function ContextParam(options: ContextParamOptions): ParameterDecorator;
