import { TaskOptions, TaskType } from "src/task/Task.types";
import { HandlerFunction } from "./Handler";
import { HttpMethod } from "../http/Http.method";
import { EntityColumnOptions, EntityColumnType, EntityOptions } from "../model/Model.entity";
import { EntityRelationColumnOptions, EntityRelationType } from "../model/Model.entity.relation";
import { MiddlewareOptions } from "../router";
import { RouteOptions } from "../router/Router.action";
import { ParamOptions, ParamType } from "../router/Router.param";
import { ClassType } from ".";
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
export interface MiddlewareMetadataArgs {
    target: Function;
    method: string;
    handler: HandlerFunction;
    options: MiddlewareOptions;
}
export interface EntityMetadataArgs<T = any> {
    target: ClassType<T>;
    options: EntityOptions;
}
export interface EntityColumnMetadataArgs {
    target: Function;
    propertyKey: string;
    type: EntityColumnType;
    options: EntityColumnOptions;
}
export interface EntityRelationMetadataArgs<T, F> {
    target: Function;
    propertyKey: string;
    type: EntityRelationType;
    table: Function;
    options: EntityRelationColumnOptions<T, F>;
}
export interface TaskMetadataArgs<T = any> {
    target: ClassType<T>;
    method: string;
    type: TaskType;
    options: TaskOptions;
}
