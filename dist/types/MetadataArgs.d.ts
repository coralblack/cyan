import { HandlerFunction } from "./Handler";
import { HttpMethod } from "../http/Http.method";
import { EntityColumnOptions, EntityColumnType, EntityOptions } from "../model/Model.entity";
import { EntityRelationColumnOptions, EntityRelationType } from "../model/Model.entity.relation";
import { MiddlewareOptions } from "../router";
import { RouteOptions } from "../router/Router.action";
import { ContextParamOptions, ParamOptions, ParamType, SystemParamOptions } from "../router/Router.param";
import { TaskOptions, TaskType } from "../task/Task.types";
import { ClassType } from ".";
export interface RouteMetadataArgs {
    target: Function;
    method: string | symbol;
    action: HttpMethod;
    path: string;
    params: any[];
    options: RouteOptions;
}
export interface RouteParamMetadataArgs<T = ParamOptions | SystemParamOptions | ContextParamOptions> {
    target: Function;
    method: string | symbol | undefined;
    index: number;
    type: ParamType;
    name: string | undefined;
    options: T;
}
export interface MiddlewareMetadataArgs {
    target: Function;
    method: string | symbol;
    handler: HandlerFunction;
    options: MiddlewareOptions;
}
export interface EntityMetadataArgs<T = any> {
    target: ClassType<T>;
    options: EntityOptions;
}
export interface EntityColumnMetadataArgs {
    target: Function;
    propertyKey: string | symbol;
    type: EntityColumnType;
    options: EntityColumnOptions;
}
export interface EntityRelationMetadataArgs {
    target: Function;
    propertyKey: string | symbol;
    type: EntityRelationType;
    table: Function;
    options: EntityRelationColumnOptions;
}
export interface TaskMetadataArgs<T = any> {
    target: ClassType<T>;
    method: string | symbol;
    type: TaskType;
    options: TaskOptions;
}
