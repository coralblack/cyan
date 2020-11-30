import { TransactionScope } from "./Model.connection";
import { DeleteOptions, FindOneOptions, FindOptions, InsertId, Paginatable, PaginationOptions, UpdateOptions } from "./Model.query";
import { RelationEntityColumnOptions, RelationEntityColumnType } from "./Model.relation.entity";
import { RepositoryColumnOptions } from "./Model.repository";
import { ClassType } from "../types";
export interface RelationEntity {
    name: string;
    columns: Array<string>;
    fields: {
        [key: string]: RepositoryColumnOptions;
    };
}
export interface RepositoryInfo<T> {
    target: ClassType<T>;
    tableName: string;
    columns: Array<string>;
    relationColumns: Array<string>;
    relationColumnTable: {
        [key: string]: RelationEntity;
    };
    relationColumnOptions: {
        [key: string]: RelationEntityColumnOptions;
    };
    relationColumnType: {
        [key: string]: RelationEntityColumnType;
    };
    fields: {
        [key: string]: RepositoryColumnOptions;
    };
    primaryColumns: Array<string>;
    criteriaColumns: Array<string>;
}
export declare const symRepositoryInfo: unique symbol;
export declare class CrudRepository<T> {
    private readonly scope;
    private readonly repositoryInfo;
    constructor(scope: TransactionScope, entity: ClassType<T>);
    static getRepositoryInfo<T>(repository: ClassType<T>): RepositoryInfo<T>;
    save(repository: T): Promise<InsertId>;
    update(repository: T, options?: UpdateOptions<T>): Promise<number>;
    delete(repository: T, options?: DeleteOptions<T>): Promise<number>;
    findOne(options?: FindOneOptions<T>): Promise<T>;
    find(options?: FindOptions<T>): Promise<T[]>;
    pagination(options?: PaginationOptions<T>): Promise<Paginatable<T>>;
    private select;
    private join;
    private where;
    private order;
    private mapping;
}
