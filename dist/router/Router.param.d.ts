import { ClassType } from "../types";
export interface ParamOptions {
    required?: boolean;
    default?: any;
    invalid?: string;
    missing?: string;
    type?: ClassType<any> | BigIntConstructor;
    delimiter?: string;
}
export declare enum ParamType {
    Query = "QUERY",
    Header = "HEADER",
    Body = "BODY",
    Path = "PATH"
}
export declare function HeaderParam(name: string, options?: ParamOptions): ParameterDecorator;
export declare function BodyParam(name: string, options?: ParamOptions): ParameterDecorator;
export declare function PathParam(name: string, options?: ParamOptions): ParameterDecorator;
export declare function QueryParam(name: string, options?: ParamOptions): ParameterDecorator;
