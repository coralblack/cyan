import { TransactionScope } from "./Model.connection";
import { EntityColumnOptions } from "./Model.entity";
import { EntityRelationColumnOptions } from "./Model.entity.relation";
import { DeleteOptions, FindOneOptions, FindOptions, InsertId, Paginatable, PaginationOptions, UpdateOptions } from "./Model.query";
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
    private readonly scope;
    private readonly repositoryInfo;
    constructor(scope: TransactionScope, entity: ClassType<T>);
    static getRepositoryInfo<T>(entity: ClassType<T>): RepositoryInfo<T>;
    save(entity: T): Promise<InsertId>;
    update(entity: T, options?: UpdateOptions<T>): Promise<number>;
    delete(entity: T, options?: DeleteOptions<T>): Promise<number>;
    findOne(options?: FindOneOptions<T>): Promise<T>;
    find(options?: FindOptions<T>): Promise<T[]>;
    pagination(options?: PaginationOptions<T>): Promise<Paginatable<T>>;
    private select;
    private joinWith;
    private join;
    private where;
    private order;
    private mapping;
}
export {};
