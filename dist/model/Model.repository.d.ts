import { ModelScope } from "./Model.connection";
import { EntityColumnOptions } from "./Model.entity";
import { ClassType } from "../types";
export interface EntityInfo<T> {
    target: ClassType<T>;
    tableName: string;
    columns: Array<string>;
    fields: {
        [key: string]: EntityColumnOptions;
    };
    primaryColumns: Array<string>;
    criteriaColumns: Array<string>;
}
declare type RawQuery = (k: string) => string;
export declare type InsertId = bigint | number;
declare type FindOperatorComp<T> = {
    ">=": T | RawQuery;
    ">": T | RawQuery;
    "<=": T | RawQuery;
    "<": T | RawQuery;
    "IS_NULL": boolean;
    "IS_NOT_NULL": boolean;
};
export declare type FindConditions<T> = {
    [P in keyof T]?: T[P] | T[P][] | Partial<FindOperatorComp<T[P]>> | RawQuery;
};
export interface FindOneOptions<T> {
    select?: (keyof T)[];
    where?: FindConditions<T>;
    order?: {
        [P in keyof T]?: "ASC" | "DESC";
    };
    debug?: boolean;
}
export interface FindOptions<T> extends FindOneOptions<T> {
    offset?: number | bigint;
    limit?: number | bigint;
}
export declare const symEntityInfo: unique symbol;
export declare class Repository<T> {
    private readonly scope;
    private readonly entity;
    private readonly entityInfo;
    constructor(scope: ModelScope, entity: ClassType<T>);
    static getEntityInfo<T>(entity: ClassType<T>): EntityInfo<T>;
    save(entity: T): Promise<InsertId>;
    findOne(options?: FindOneOptions<T>): Promise<T>;
    find(options?: FindOptions<T>): Promise<T[]>;
    private select;
    private mapping;
}
export {};
