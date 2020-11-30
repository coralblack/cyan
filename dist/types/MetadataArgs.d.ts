import { RelationEntityColumnOptions, RelationEntityColumnType } from "src/model/Model.relation.entity";
import { TaskOptions, TaskType } from "src/task/Task.types";
import { HandlerFunction } from "./Handler";
import { HttpMethod } from "../http/Http.method";
import { RepositoryColumnOptions, RepositoryColumnType, RepositoryOptions } from "../model/Model.repository";
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
export interface RepositoryMetadataArgs<T = any> {
    target: ClassType<T>;
    options: RepositoryOptions;
}
export interface RepositoryColumnMetadataArgs {
    target: Function;
    propertyKey: string;
    type: RepositoryColumnType;
    options: RepositoryColumnOptions;
}
export interface RelationEntityColumnMetadataArgs {
    target: Function;
    propertyKey: string;
    type: RelationEntityColumnType;
    table: Function;
    options: RelationEntityColumnOptions;
}
export interface TaskMetadataArgs<T = any> {
    target: ClassType<T>;
    method: string;
    type: TaskType;
    options: TaskOptions;
}
