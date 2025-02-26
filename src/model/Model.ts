import { ConnectionManager, TransactionScope } from "./Model.connection";
import { TraceableError } from "../core/Error";

export enum ModelConnectivitySettingsDriver {
  MySQL = "mysql2",
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
  extra?: { [key: string]: any };
}

export interface ModelSettings extends ModelConnectivitySettings {}

export type TxDelegate<T> = (scope: TransactionScope) => Promise<T>;

export abstract class Model {
  protected readonly settings: ModelSettings;
  private readonly _connection: ConnectionManager;

  constructor(settings?: ModelSettings) {
    this.settings = Object.assign(
      {
        driver: process.env.CYAN_DB_DRIVER || ModelConnectivitySettingsDriver.MySQL,
        host: process.env.CYAN_DB_HOST || null,
        port: process.env.CYAN_DB_PORT || 3306,
        username: process.env.CYAN_DB_USERNAME || null,
        password: process.env.CYAN_DB_PASSWORD || null,
        database: process.env.CYAN_DB_DATABASE || null,
        charset: process.env.CYAN_DB_CHARSET || "utf8",
        timezone: process.env.CYAN_DB_TIMEZONE || null,
        poolMin: process.env.CYAN_DB_POOL_MIN || 0,
        poolMax: process.env.CYAN_DB_POOL_MAX || 10,
        connectTimeout: process.env.CYAN_DB_CONNECT_TIMEOUT || 60 * 1000,
        createConnectionTimeout: process.env.CYAN_DB_CREATE_CONNECTION_TIMEOUT || 30 * 1000,
        acquireConnectionTimeout: process.env.CYAN_DB_ACQUIRE_CONNECTION_TIMEOUT || 60 * 1000,
      },
      settings
    );

    this._connection = ConnectionManager.getConnectionManager(this.settings);
  }

  async transactionWith<T>(delegate: TxDelegate<T>, scope?: TransactionScope): Promise<T> {
    if (scope) {
      try {
        const resp = await delegate(scope);

        return resp;
      } catch (err) {
        throw TraceableError(err as Error);
      }
    }

    return this._connection.transaction(async scope => {
      const resp = await delegate(scope);

      return resp;
    });
  }

  protected get connection(): ConnectionManager {
    return this._connection;
  }
}
