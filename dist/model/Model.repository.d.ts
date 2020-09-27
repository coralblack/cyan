import { ModelScope } from "./Model.connection";
import { ClassType } from "../types";
export interface EntityOptions {
    name: string;
}
export declare enum EntityColumnType {
    Primary = "PRIMARY",
    Column = "COLUMN"
}
export interface EntityColumnOptions {
    name: string;
}
export declare function Entity(options?: EntityOptions): ClassDecorator;
export declare function PrimaryColumn(options: EntityColumnOptions): PropertyDecorator;
export declare function Column(options: EntityColumnOptions): PropertyDecorator;
interface EntityInfo<T> {
    target: ClassType<T>;
    tableName: string;
    columns: Array<string>;
    fields: {
        [key: string]: string;
    };
    primaryColumns: Array<string>;
    criteriaColumns: Array<string>;
}
declare type RawQuery = (k: string) => string;
declare type InsertId = bigint | number;
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
