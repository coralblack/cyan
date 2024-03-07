/// <reference types="node" />
import internal from "stream";
import { Knex } from "knex";
import { TransactionScope } from "./Model.connection";
import { EntityColumnOptions } from "./Model.entity";
import { EntityRelationColumnOptions } from "./Model.entity.relation";
import { CountOptions, DeleteOptions, FindOneOptions, FindOptions, InsertId, Paginatable, PaginationOptions, StreamFunctions, UpdateBulkOptions, UpdateOptions } from "./Model.query";
import { ClassType } from "../types";
interface RelationalRepositoryInfo<T = any> {
    options: EntityRelationColumnOptions;
    repository: RepositoryInfo<T>;
}
export interface RepositoryInfo<T = any> {
    target: ClassType<T>;
    tableName: string;
    columns: Array<string>;
    fields: {
        [key: string]: EntityColumnOptions;
    };
    primaryColumns: Array<string>;
    criteriaColumns: Array<string>;
    oneToOneRelationColumns: Array<string>;
    oneToOneRelations: {
        [key: string]: RelationalRepositoryInfo;
    };
}
export declare const symRepositoryInfo: unique symbol;
export declare class Repository<T> {
    private readonly repositoryInfo;
    private readonly kx;
    constructor(scope: TransactionScope | Knex, entity: ClassType<T>);
    static getRepositoryInfo<T>(entity: ClassType<T>): RepositoryInfo<T>;
    save(entity: T, trx?: TransactionScope): Promise<InsertId>;
    saveBulk(entities: Array<T>, trx?: TransactionScope): Promise<InsertId[]>;
    update(entity: T, options?: UpdateOptions<T>, trx?: TransactionScope): Promise<number>;
    updateBulk(entities: Array<T>, options: UpdateBulkOptions<T>, trx?: TransactionScope): Promise<number>;
    delete(entity: T, options?: DeleteOptions<T>, trx?: TransactionScope): Promise<number>;
    findOne(options?: FindOneOptions<T>, trx?: TransactionScope): Promise<T>;
    find(options?: FindOptions<T>, trx?: TransactionScope): Promise<T[]>;
    pagination(options?: PaginationOptions<T>, trx?: TransactionScope): Promise<Paginatable<T>>;
    streaming(options: FindOptions<T>): internal.PassThrough & AsyncIterable<T>;
    streamAsync(options: FindOptions<T>, streamFn: StreamFunctions<T>): Promise<void>;
    private prepareQuery;
    private select;
    count(options: CountOptions<T>, trx?: TransactionScope): Promise<bigint>;
    private joinWith;
    private join;
    private where;
    private order;
    private mapping;
}
export {};
