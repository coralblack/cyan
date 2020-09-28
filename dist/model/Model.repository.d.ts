import { TransactionScope } from "./Model.connection";
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
export interface UpdateOptions<T> {
    where?: FindConditions<T>;
    update?: (keyof T)[];
    debug?: boolean;
}
export interface DeleteOptions<T> {
    where?: FindConditions<T>;
    debug?: boolean;
}
export declare const symEntityInfo: unique symbol;
export declare class Repository<T> {
    private readonly scope;
    private readonly entity;
    private readonly entityInfo;
    constructor(scope: TransactionScope, entity: ClassType<T>);
    static getEntityInfo<T>(entity: ClassType<T>): EntityInfo<T>;
    save(entity: T): Promise<InsertId>;
    update(entity: T, options?: UpdateOptions<T>): Promise<number>;
    delete(entity: T, options?: DeleteOptions<T>): Promise<number>;
    findOne(options?: FindOneOptions<T>): Promise<T>;
    find(options?: FindOptions<T>): Promise<T[]>;
    private select;
    private where;
    private mapping;
}
export {};
