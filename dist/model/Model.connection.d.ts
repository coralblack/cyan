/// <reference types="node" />
import knex from "knex";
import { ModelConnectivitySettings } from "./Model";
import { Repository } from "./Model.repository";
import { ClassType } from "../types";
export declare type QueryParameterTypes = string | number | bigint | boolean | null | Date | Array<string> | Array<number> | Array<Date> | Array<boolean> | Buffer;
export declare class TransactionScope {
    readonly kx: knex;
    constructor(kx: knex);
    execute(query: string, params?: Array<QueryParameterTypes>): Promise<any>;
    getRepository<T>(entity: ClassType<T>): Repository<T>;
}
export declare class ConnectionManager {
    private readonly kx;
    constructor(kx: knex);
    static getConnectionManager(settings: ModelConnectivitySettings): ConnectionManager;
    transaction<T>(ctx: (conn: TransactionScope) => Promise<T>): Promise<T>;
}
