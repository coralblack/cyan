/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import { plainToClass } from "class-transformer";
import { TransactionScope } from "./Model.connection";
import { EntityColumnOptions, EntityColumnType } from "./Model.entity";
import { DeleteOptions, FindConditions, FindOneOptions, FindOptions, InsertId, OrderCondition, UpdateOptions } from "./Model.query";
import { Metadata } from "../core/Decorator";
import { TraceableError } from "../core/Error";
import { ClassType } from "../types";

export interface EntityInfo<T> {
  target: ClassType<T>;
  tableName: string;
  columns: Array<string>;
  fields: { [key: string]: EntityColumnOptions };
  primaryColumns: Array<string>;
  criteriaColumns: Array<string>;
}

export const symEntityInfo = Symbol();

export class Repository<T> {
  private readonly entityInfo: EntityInfo<T>;

  constructor(private readonly scope: TransactionScope, private readonly entity: ClassType<T>) {
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
    try {
      const [res] = await this.scope.kx.insert(this.entityInfo.columns.reduce((p, e) => {
        const key = this.entityInfo.fields[e].name;
        const val = ((v): any => {
          if (typeof v === "function") return this.scope.kx.raw(v(key));
          else if (v === undefined && this.entityInfo.fields[e].default) {
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
    } catch (err) {
      throw TraceableError(err);
    }
  }

  async update(entity: T, options?: UpdateOptions<T>): Promise<number> {
    try {
      let kx = this.scope.kx.from(this.entityInfo.tableName);

      const conditions: FindConditions<T> = Object.assign({}, options?.where || {});

      this.entityInfo.primaryColumns.forEach(e => {
        conditions[e] = entity[e];
      });

      kx = this.where(kx, conditions);
      kx = kx.update(((options?.update || this.entityInfo.columns) as any).reduce((p, e) => {
        p[this.entityInfo.fields[e].name] = entity[e];
        return p;
      }, {}));

      if (options?.debug) {
        // eslint-disable-next-line no-console
        console.log(">", kx.toSQL());
      }

      const affected = await kx;

      return Number(affected);
    } catch (err) {
      throw TraceableError(err);
    }
  }

  async delete(entity: T, options?: DeleteOptions<T>): Promise<number> {
    try {
      let kx = this.scope.kx.from(this.entityInfo.tableName);

      const conditions: FindConditions<T> = Object.assign({}, options?.where || {});

      this.entityInfo.primaryColumns.forEach(e => {
        conditions[e] = entity[e];
      });

      kx = this.where(kx, conditions);
      kx = kx.del();

      if (options?.debug) {
        // eslint-disable-next-line no-console
        console.log(">", kx.toSQL());
      }

      const affected = await kx;

      return Number(affected);
    } catch (err) {
      throw TraceableError(err);
    }
  }

  async findOne(options?: FindOneOptions<T>): Promise<T> {
    try {
      const [res] = await this.select({ ...options, limit: 1 });

      return res || null;
    } catch (err) {
      throw TraceableError(err);
    }
  }

  async find(options?: FindOptions<T>): Promise<T[]> {
    try {
      const res = await this.select(options);

      return res;
    } catch (err) {
      throw TraceableError(err);
    }
  }

  private async select(options?: FindOptions<T>): Promise<T[]> {
    try {
      const selectColumns: any[] = options.select || this.entityInfo.columns;
      const select = selectColumns.map(e => this.entityInfo.fields[e].name);

      let kx = this.scope.kx.select(select).from(this.entityInfo.tableName);

      // Query
      if (options.where) {
        kx = this.where(kx, options.where);
      }

      // Sort
      if (options.order) {
        kx = this.order(kx, options.order);
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

  private where(kx: any, where?: FindConditions<T>): any {
    let kxx = kx;

    Object.keys(where).forEach(ke => {
      const k = this.entityInfo.fields[ke].name;
      const v = where[ke];

      if (Array.isArray(v)) kxx = kxx.whereIn(k, v);
      else if (typeof v === "object" && (v[">="] || v[">"] || v["<="] || v["<"] || typeof v["IS_NULL"] === "boolean" || typeof v["IS_NOT_NULL"] === "boolean")) {
        kxx.andWhere(function() {
          Object.keys(v).forEach((condition) => {
            if (condition === "IS_NULL" || condition === "IS_NOT_NULL") {
              if (v["IS_NULL"] === true || v["IS_NOT_NULL"] === false) {
                this.whereNull(k);
              } else if (v["IS_NULL"] === false || v["IS_NOT_NULL"] === true) {
                this.whereNotNull(k);
              }
            }
            else if (typeof v[condition] === "function") {
              this.whereRaw(`${k} ${condition} ${v[condition](k)}`);
            } else {
              this.where(k, condition, v[condition]);
            }
          });
        });
      }
      else if (typeof v === "function") kxx = kxx.where(this.scope.kx.raw(v(k)));
      else kxx = kxx.where(k, v);
    });

    return kxx;
  }

  private order(kx: any, order?: OrderCondition<T>): any {
    let kxx = kx;

    Object.keys(order).forEach(ke => {
      const k = this.entityInfo.fields[ke].name;
      const v = order[ke];

      if (typeof v === "function") {
        kxx = kx.orderByRaw(v(k));
      } else {
        kxx = kx.orderBy(k, v);
      }
    });

    return kxx;
  }

  private mapping(select: string[], row: any): T {
    const x = plainToClass(this.entityInfo.target, select.reduce((p, e) => {
      p[e] = row[this.entityInfo.fields[e].name];
      return p;
    }, {}));

    return x;
  }
}