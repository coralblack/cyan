import { Metadata } from "../core/Decorator";
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

export interface ContextParamAttributes {}

export interface ParamClassOptions extends ParamBaseOptions {
  type?: ClassType<any> | BigIntConstructor;
}

export interface ParamEnumOptions<T extends { [key: string]: string | number }> extends ParamBaseOptions {
  type: "ENUM";
  enum: T;
  array?: boolean;
}

export type ParamOptions<T extends { [key: string]: string | number } = any> = ParamClassOptions | ParamEnumOptions<T>;

export enum ParamType {
  Query = "QUERY",
  Header = "HEADER",
  Body = "BODY",
  Path = "PATH",
  System = "SYSTEM",
  Context = "CONTEXT",
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

function Param(
  type: ParamType,
  name: string | undefined,
  options: ParamOptions | SystemParamOptions | ContextParamOptions
): ParameterDecorator {
  return function ParamInner(target: any, method: string | symbol | undefined, index: number) {
    Metadata.getStorage().routeParams.push({
      target: target.constructor,
      method,
      index,
      type,
      name,
      options,
    });
  };
}

export function HeaderParam(name: string, options?: ParamOptions): ParameterDecorator {
  return Param(ParamType.Header, name, options || {});
}

export function BodyParam(name: string, options?: ParamOptions): ParameterDecorator {
  return Param(ParamType.Body, name, options || {});
}

export function PathParam(name: string, options?: ParamOptions): ParameterDecorator {
  return Param(ParamType.Path, name, options || {});
}

export function QueryParam(name: string, options?: ParamOptions): ParameterDecorator {
  return Param(ParamType.Query, name, options || {});
}

export function SystemParam(options: SystemParamOptions): ParameterDecorator {
  return Param(ParamType.System, undefined, options);
}

export function ContextParam(options: ContextParamOptions): ParameterDecorator {
  return Param(ParamType.Context, undefined, options);
}
