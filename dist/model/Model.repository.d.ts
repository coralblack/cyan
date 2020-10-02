import { TransactionScope } from "./Model.connection";
import { EntityColumnOptions } from "./Model.entity";
import { DeleteOptions, FindOneOptions, FindOptions, InsertId, Paginatable, PaginationOptions, UpdateOptions } from "./Model.query";
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
    pagination(options?: PaginationOptions<T>): Promise<Paginatable<T>>;
    private select;
    private where;
    private order;
    private mapping;
}
