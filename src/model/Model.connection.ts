import knex from "knex";
import { ModelConnectivitySettings, ModelConnectivitySettingsDriver } from "./Model";
import { Repository } from "./Model.repository";
import { ClassType } from "../types";

const managers: { [key: string]: ConnectionManager } = {};

export type QueryParameterTypes =
  | string
  | number
  | bigint
  | boolean
  | null
  | Date
  | Array<string>
  | Array<number>
  | Array<Date>
  | Array<boolean>
  | Buffer;

export class TransactionScope {
  constructor(public readonly kx: knex) { }
  
  async execute(query: string, params?: Array<QueryParameterTypes>): Promise<any> {
    const [res] = await this.kx.raw(query, params as any);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return res;
  }

  getRepository<T>(entity: ClassType<T>): Repository<T> {
    return new Repository<T>(this, entity);
  }
}

export class ConnectionManager {
  constructor(private readonly kx: knex) {}

  static getConnectionManager(settings: ModelConnectivitySettings): ConnectionManager {
    const key = `${settings.driver}/${settings.username}:###@${settings.host}:${settings.port}/${settings.database}`;

    if (managers[key]) return managers[key];

    const opts: any = {
      client: settings.driver,
      connection: {
        host: settings.host,
        user: settings.username,
        port: settings.port,
        password: settings.password,
        database: settings.database,
        timezone: settings.timezone,
        charset: settings.charset,
        supportBigNumbers: true,
        bigNumberStrings: true,
      },
      pool: {
        min: settings.poolMin,
        max: settings.poolMax,
      },
    };

    if (settings.driver === ModelConnectivitySettingsDriver.MySQL) {
      // hack, `connection.timezone` for mysql2
      delete opts.connection.timezone;

      opts.options = { bindObjectAsString: true };

      if (settings.timezone) {
        opts.pool.afterCreate = function(connection: any, callback: any) {
          connection.query(`SET time_zone = '${settings.timezone.replace(/'/g, "\\'")}';`, function(err) {
            callback(err, connection);
          });
        };
      }
      
      opts.connection.typeCast = function(field: any, next: any): any {
        /* eslint-disable @typescript-eslint/no-unsafe-return */
        if (["NEWDECIMAL", "DECIMAL", "LONGLONG"].includes(field.type)) {
          const val = field.string();

          if (val === null) return null;

          if (field.type === "LONGLONG") {
            return BigInt(val);
          } else {
            return val;
          }
        }

        return next();
      };
    }

    const kx = knex(opts);

    managers[key] = new ConnectionManager(kx);
    return managers[key];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transaction<T>(ctx: (conn: TransactionScope) => Promise<T>): Promise<T> {
    return this.kx.transaction((trx: knex) => {
      const connectivity = new TransactionScope(trx);

      return ctx(connectivity);
    });
  }
}