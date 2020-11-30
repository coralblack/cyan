import { TransactionScope } from "./Model.connection";
import { EntityColumnOptions } from "./Model.entity";
import { EntityRelationColumnOptions, EntityRelationType } from "./Model.entity.relation";
import { DeleteOptions, FindOneOptions, FindOptions, InsertId, Paginatable, PaginationOptions, UpdateOptions } from "./Model.query";
import { ClassType } from "../types";
export interface RelationEntity {
    name: string;
    columns: Array<string>;
    fields: {
        [key: string]: EntityColumnOptions;
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
        [key: string]: EntityRelationColumnOptions<any, T>;
    };
    relationColumnType: {
        [key: string]: EntityRelationType;
    };
    fields: {
        [key: string]: EntityColumnOptions;
    };
    primaryColumns: Array<string>;
    criteriaColumns: Array<string>;
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
    private join;
    private where;
    private order;
    private mapping;
}
