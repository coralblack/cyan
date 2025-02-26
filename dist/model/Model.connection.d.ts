/// <reference types="node" />
import { Knex } from "knex";
import { ModelConnectivitySettings } from "./Model";
import { Repository } from "./Model.entity.repository";
import { ClassType } from "../types";
export type QueryParameterTypes = string | number | bigint | boolean | null | Date | Array<string> | Array<number> | Array<bigint> | Array<Date> | Array<boolean> | Buffer;
export declare class TransactionScope {
    readonly kx: Knex;
    constructor(kx: Knex);
    execute(query: string, params?: Array<QueryParameterTypes>, options?: {
        debug: boolean;
    }): Promise<any>;
    getRepository<T extends Record<string | symbol, any>>(repository: ClassType<T>): Repository<T>;
}
export declare class ConnectionManager {
    private readonly kx;
    constructor(kx: Knex);
    static getConnectionManager(settings: ModelConnectivitySettings): ConnectionManager;
    transaction<T>(ctx: (conn: TransactionScope) => Promise<T>): Promise<T>;
    getRepository<T extends Record<string | symbol, any>>(entity: ClassType<T>): Repository<T>;
}
