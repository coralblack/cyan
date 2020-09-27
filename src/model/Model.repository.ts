/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import { plainToClass } from "class-transformer";
import { ModelScope } from "./Model.connection";
import { EntityColumnOptions, EntityColumnType } from "./Model.entity";
import { Metadata } from "../core/Decorator";
import { TraceableError } from "../core/Error";
import { ClassType } from "../types";

export interface EntityInfo<T> {
  target: ClassType<T>;
  tableName: string;
  columns: Array<string>;
  fields: {[key: string]: EntityColumnOptions};
  primaryColumns: Array<string>;
  criteriaColumns: Array<string>;
}

type RawQuery = (k: string) => string;
export type InsertId = bigint | number;

type FindOperatorComp<T> = { 
  ">=": T | RawQuery;
  ">": T | RawQuery;
  "<=": T | RawQuery;
  "<": T | RawQuery;
  "IS_NULL": boolean;
  "IS_NOT_NULL": boolean;
};

export type FindConditions<T> = {
  [P in keyof T]?: T[P] | T[P][] | Partial<FindOperatorComp<T[P]>>| RawQuery;
};

export interface FindOneOptions<T> {
  select?: (keyof T)[];
  where?: FindConditions<T>;
  order?: {[P in keyof T]?: "ASC" | "DESC"};
  debug?: boolean;
}

export interface FindOptions<T> extends FindOneOptions<T> {
  offset?: number | bigint;
  limit?: number | bigint;
}

export const symEntityInfo = Symbol();

export class Repository<T> {
  private readonly entityInfo: EntityInfo<T>;

  constructor(private readonly scope: ModelScope, private readonly entity: ClassType<T>) {
    this.entityInfo = Repository.getEntityInfo(entity);
  }

  static getEntityInfo<T>(entity: ClassType<T>): EntityInfo<T> {
    if (entity[symEntityInfo]) return entity[symEntityInfo];

    const metadata = Metadata.getStorage().entities.find(e => e.target === entity);
    const columns = Metadata.getStorage().entityColumns.filter(e => e.target === entity);

    if (!metadata) {
      throw new Error(`Invalid Repository: No Decorated Entity (${entity.name})`);
    } else if (!columns.length) {
      throw new Error(`Invalid Repository: No Decorated Columns (${entity.name})`);
    }

    const info = {
      target: metadata.target,
      tableName: metadata.options.name,
      columns: columns.map(e => e.propertyKey),
      fields: columns.reduce((p, e) => { p[e.propertyKey] = e.options; return p; }, {}),
      primaryColumns: columns.filter(e => e.type === EntityColumnType.Primary).map(e => e.propertyKey),
      criteriaColumns: columns.filter(e => e.type === EntityColumnType.Primary).map(e => e.propertyKey),
    };

    entity[symEntityInfo] = info;
    return info;
  }

  async save(entity: T): Promise<InsertId> {
    const [res] = await this.scope.kx.insert(this.entityInfo.columns.reduce((p, e) => {
      const key = this.entityInfo.fields[e].name;
      const val = ((v): any => {
        if (typeof v === "function") return this.scope.kx.raw(v(key));
        else if (!v && this.entityInfo.fields[e].default) {
          return this.scope.kx.raw(this.entityInfo.fields[e].default(key));
        }
        else return v;
      })(entity[e]);

      p[key] = val;
      return p;
    }, {})).into(this.entityInfo.tableName);

    if (this.entityInfo.primaryColumns.length === 1) {
      const id = entity[this.entityInfo.primaryColumns[0]];

      if (id && typeof id !== "function") {
        return entity[this.entityInfo.primaryColumns[0]];
      }
    }

    const [[lid]] = await this.scope.kx.raw("SELECT LAST_INSERT_ID() AS seq");

    return res || lid.seq;
  }

  async findOne(options?: FindOneOptions<T>): Promise<T> {
    const [res] = await this.select({ ...options, limit: 1 });

    return res;
  }

  find(options?: FindOptions<T>): Promise<T[]> {
    return this.select(options);
  }

  private async select(options?: FindOptions<T>): Promise<T[]> {
    try {
      const selectColumns: any[] = options.select || this.entityInfo.columns;
      const select = selectColumns.map(e => this.entityInfo.fields[e].name);

      let kx = this.scope.kx.select(select).from(this.entityInfo.tableName);

      // Query
      if (options.where) {
        Object.keys(options.where).forEach(ke => {
          const k = this.entityInfo.fields[ke].name;
          const v = options.where[ke];

          if (Array.isArray(v))
            kx = kx.whereIn(k, v);
          else if (typeof v === "function")
            kx = kx.where(this.scope.kx.raw(v(k)));
          else
            kx = kx.where(k, v);
        });
      }

      // Pagination
      if (options.offset)
        kx = kx.offset(String(options.offset) as any);
      if (options.limit)
        kx = kx.limit(String(options.limit) as any);

      if (options.debug) {
        // eslint-disable-next-line no-console
        console.log(">", kx.toSQL());
      }

      const rows = await kx;

      if (!rows || !rows.length)
        return [];

      return rows.map((e: any) => this.mapping(selectColumns, e));

    } catch (err) {
      throw TraceableError(err);
    }
  }

  private mapping(select: string[], row: any): T {
    const x = plainToClass(this.entityInfo.target, select.reduce((p, e) => {
      p[e] = row[this.entityInfo.fields[e].name];
      return p;
    }, {}));

    return x;
  }
}