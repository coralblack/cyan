import { Method as HttpMethod } from "../http/Http.method";
import { RouteOptions } from "../router/Router.action";
import { ParamOptions, ParamType } from "../router/Router.param";
export interface RouteMetadataArgs {
    target: Function;
    method: string;
    action: HttpMethod;
    path: string;
    params: any[];
    options: RouteOptions;
}
export interface RouteParamMetadataArgs {
    target: Function;
    method: string;
    index: number;
    type: ParamType;
    name: string;
    options: ParamOptions;
}
