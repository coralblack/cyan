import { Metadata } from "../core/Decorator";
import { ClassType } from "../types";

export interface ParamBaseOptions {
  required?: boolean;
  default?: any;
  invalid?: string;
  missing?: string;
  delimiter?: string;
}

export interface ParamClassOptions extends ParamBaseOptions {
  type?: ClassType<any> | BigIntConstructor;
}

export interface ParamEnumOptions<T extends {[key: string]: string | number}> extends ParamBaseOptions {
  type: "ENUM";
  enum: T;
}

export type ParamOptions<T extends {[key: string]: string | number} = any> = ParamClassOptions | ParamEnumOptions<T>;

export enum ParamType {
  Query = "QUERY",
  Header = "HEADER",
  Body = "BODY",
  Path = "PATH"
}

function Param(type: ParamType, name: string, options: ParamOptions): ParameterDecorator {
  return function ParamInner(target: any, method: string, index: number) {
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
