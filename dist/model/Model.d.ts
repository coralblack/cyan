import { TransactionScope } from "./Model.connection";
export declare enum ModelConnectivitySettingsDriver {
    MySQL = "mysql2"
}
export interface ModelConnectivitySettings {
    driver?: ModelConnectivitySettingsDriver;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    charset?: string;
    timezone?: string;
    poolMin?: number;
    poolMax?: number;
    connectTimeout?: number;
    createConnectionTimeout?: number;
    acquireConnectionTimeout?: number;
    extra?: {
        [key: string]: any;
    };
}
export interface ModelSettings extends ModelConnectivitySettings {
}
export declare type TxDelegate<T> = (scope: TransactionScope) => Promise<T>;
export declare abstract class Model {
    protected readonly settings: ModelSettings;
    constructor(settings?: ModelSettings);
    transactionWith<T>(delegate: TxDelegate<T>, scope?: TransactionScope): Promise<T>;
}
