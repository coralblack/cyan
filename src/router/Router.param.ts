import { Metadata } from "../core/Decorator";
import { ClassType, EnumType } from "../types";

export interface ParamOptions {
  required?: boolean;
  default?: any;
  invalid?: string;
  missing?: string;
  type?: ClassType<any> | EnumType | BigIntConstructor;
  delimiter?: string;
}

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
