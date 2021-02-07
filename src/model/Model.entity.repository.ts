/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import { plainToClass } from "class-transformer";
import { TransactionScope } from "./Model.connection";
import { EntityColumnOptions, EntityColumnType } from "./Model.entity";
import { EntityRelationColumnOptions, EntityRelationType } from "./Model.entity.relation";
import {
  CountOptions,
  DeleteOptions,
  FindChainingConditions,
  FindConditions,
  FindOneOptions,
  FindOptions,
  InsertId,
  OrderCondition,
  Paginatable,
  PaginationOptions,
  UpdateOptions,
} from "./Model.query";
import { Metadata } from "../core/Decorator";
import { TraceableError } from "../core/Error";
import { ClassType } from "../types";

const joinSeparator = "_";

interface RelationalRepositoryInfo<T = any> {
  options: EntityRelationColumnOptions;
  repository: RepositoryInfo<T>;
}

export interface RepositoryInfo<T = any> {
  target: ClassType<T>;
  tableName: string;
  columns: Array<string>;
  fields: { [key: string]: EntityColumnOptions };
  primaryColumns: Array<string>;
  criteriaColumns: Array<string>;
  oneToOneRelationColumns: Array<string>;
  oneToOneRelations: { [key: string]: RelationalRepositoryInfo };
}

export const symRepositoryInfo = Symbol();

export class Repository<T> {
  private readonly repositoryInfo: RepositoryInfo<T>;

  constructor(private readonly scope: TransactionScope, entity: ClassType<T>) {
    this.repositoryInfo = Repository.getRepositoryInfo(entity);
  }

  static getRepositoryInfo<T>(entity: ClassType<T>): RepositoryInfo<T> {
    if (entity[symRepositoryInfo]) return entity[symRepositoryInfo];

    const info: RepositoryInfo<T> = {} as any;

    // To preventing infinite recursive initialization.
    entity[symRepositoryInfo] = info;

    const metadata = Metadata.getStorage().entities.find(e => e.target === entity);
    const columns = Metadata.getStorage().entityColumns.filter(e => e.target === entity);
    const relations = Metadata.getStorage().entityRelations.filter(e => e.target === entity);

    if (!metadata) {
      throw new Error(`Invalid Repository: No Decorated Entity (${entity.name})`);
    } else if (!columns.length) {
      throw new Error(`Invalid Repository: No Decorated Columns (${entity.name})`);
    }

    (info.target = metadata.target),
      (info.tableName = metadata.options.name),
      (info.columns = columns.map(e => e.propertyKey)),
      (info.fields = columns.reduce((p, e) => {
        p[e.propertyKey] = e.options;
        return p;
      }, {})),
      (info.primaryColumns = columns.filter(e => e.type === EntityColumnType.Primary).map(e => e.propertyKey)),
      (info.criteriaColumns = columns.filter(e => e.type === EntityColumnType.Primary).map(e => e.propertyKey)),
      (info.oneToOneRelationColumns = relations.filter(e => e.type === EntityRelationType.OneToOne).map(e => e.propertyKey)),
      (info.oneToOneRelations = relations
        .filter(e => e.type === EntityRelationType.OneToOne)
        .reduce((p, e) => {
          p[e.propertyKey] = {
            options: {
              ...e.options,
              name: Array.isArray(e.options.name) ? e.options.name : [e.options.name],
            },
            repository: Repository.getRepositoryInfo(e.options.target),
          };
          return p;
        }, {}));

    return info;
  }

  async save(entity: T): Promise<InsertId> {
    try {
      const [res] = await this.scope.kx
        .insert(
          this.repositoryInfo.columns.reduce((p, e) => {
            const key = this.repositoryInfo.fields[e].name;
            const val = ((v): any => {
              if (typeof v === "function") return this.scope.kx.raw(v(key));
              else if (v === undefined && this.repositoryInfo.fields[e].default) {
                return this.scope.kx.raw(this.repositoryInfo.fields[e].default(key));
              } else return v;
            })(entity[e]);

            p[key] = val;
            return p;
          }, {})
        )
        .into(this.repositoryInfo.tableName);

      if (this.repositoryInfo.primaryColumns.length === 1) {
        const id = entity[this.repositoryInfo.primaryColumns[0]];

        if (id && typeof id !== "function") {
          return entity[this.repositoryInfo.primaryColumns[0]];
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
      let kx = this.scope.kx.from(this.repositoryInfo.tableName);

      const conditions: FindConditions<T> = Object.assign({}, options?.where || {});

      this.repositoryInfo.primaryColumns.forEach(e => {
        conditions[e] = entity[e];
      });

      kx = this.where(kx, conditions);
      kx = kx.update(
        ((options?.update || this.repositoryInfo.columns) as any).reduce((p, e) => {
          p[this.repositoryInfo.fields[e].name] = entity[e];
          return p;
        }, {})
      );

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
      let kx = this.scope.kx.from(this.repositoryInfo.tableName);

      const conditions: FindConditions<T> = Object.assign({}, options?.where || {});

      this.repositoryInfo.primaryColumns.forEach(e => {
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

  async pagination(options?: PaginationOptions<T>): Promise<Paginatable<T>> {
    try {
      const page = Math.max(1, options && options.page ? options.page : 1);
      const rpp = Math.max(1, options && options.rpp ? options.rpp : 30);
      const limit = BigInt(rpp);
      const offset: bigint = (BigInt(page) - BigInt(1)) * limit;

      const count = (await this.where(this.scope.kx.from(this.repositoryInfo.tableName), options.where || {}).count("* as cnt"))[0].cnt;

      const items = await this.find({ ...options, limit, offset });

      return {
        page,
        rpp,
        count,
        items,
      };
    } catch (err) {
      throw TraceableError(err);
    }
  }

  private async select(options: FindOptions<T>): Promise<T[]> {
    try {
      const selectColumns: any[] = options.select || this.repositoryInfo.columns;
      const select = selectColumns
        .filter(x => this.repositoryInfo.columns.indexOf(x) !== -1)
        .map(column => `${this.repositoryInfo.tableName}.${this.repositoryInfo.fields[column].name} as ${column}`);

      let kx = this.scope.kx.select(select).from(this.repositoryInfo.tableName);

      if (options.forUpdate) {
        kx = kx.forUpdate();
      }

      kx = this.join(kx, options.select);

      // Query
      if (options.where) {
        kx = this.where(kx, options.where);
      }

      // Sort
      if (options.order) {
        if (Array.isArray(options.order)) {
          for (let i = 0; i < options.order.length; i++) {
            kx = this.order(kx, options.order[i]);
          }
        } else {
          kx = this.order(kx, options.order);
        }
      }

      // Pagination
      if (options.offset) kx = kx.offset(String(options.offset) as any);
      if (options.limit) kx = kx.limit(String(options.limit) as any);

      if (options.debug) {
        // eslint-disable-next-line no-console
        console.log(">", kx.toSQL());
      }

      const rows = await kx;

      if (!rows || !rows.length) return [];

      return rows.map((row: any) => this.mapping(row));
    } catch (err) {
      throw TraceableError(err);
    }
  }

  async count(options: CountOptions<T>): Promise<bigint> {
    try {
      let kx = this.scope.kx.count("* AS cnt").from(this.repositoryInfo.tableName);

      kx = this.join(kx, []);

      // Query
      if (options.where) {
        kx = this.where(kx, options.where);
      }

      if (options.debug) {
        // eslint-disable-next-line no-console
        console.log(">", kx.toSQL());
      }

      const res = await kx;

      if (!res || !res.length) return BigInt(0);

      return BigInt(res[0].cnt || 0);
    } catch (err) {
      throw TraceableError(err);
    }
  }

  private joinWith(kx: any, rec: number, fromTable: string, propertyKey: string, to: RelationalRepositoryInfo) {
    const kxx = kx;
    const fromColumns = to.options.name;
    const toFields = to.repository.fields;
    const toColumns = to.repository.primaryColumns;
    const toTableNameAlias = `${to.repository.tableName}_${rec}`;
    const toTable = `${to.repository.tableName} AS ${toTableNameAlias}`;
    const joinTableColumns = to.repository.columns.map(
      col => `${toTableNameAlias}.${to.repository.fields[col].name} as ${propertyKey}${joinSeparator}${col}`
    );

    if (fromColumns.length !== toColumns.length) {
      throw new Error(
        `Invalid Relation: Joining columns are not matched (${(fromColumns as string[]).join(",")} -> ${toColumns.join(",")})`
      );
    }

    kxx.leftOuterJoin(toTable, function () {
      for (let i = 0; i < fromColumns.length; i++) {
        this.on(`${fromTable}.${fromColumns[i]}`, `${toTableNameAlias}.${toFields[toColumns[i]].name}`);
      }
    });
    kxx.select(joinTableColumns);

    let idx = 0;

    to.repository.oneToOneRelationColumns.forEach(relationColumn => {
      this.joinWith(
        kxx,
        rec * 10 + idx++,
        toTableNameAlias,
        `${propertyKey}${joinSeparator}${relationColumn}`,
        to.repository.oneToOneRelations[relationColumn]
      );
    });

    return kxx;
  }

  private join(kx: any, selectColumns: Array<keyof T>): any {
    const kxx = kx;
    let idx = 0;

    this.repositoryInfo.oneToOneRelationColumns.forEach(relationColumn => {
      if (!selectColumns || selectColumns.indexOf(relationColumn as keyof T) !== -1) {
        this.joinWith(kxx, ++idx, this.repositoryInfo.tableName, relationColumn, this.repositoryInfo.oneToOneRelations[relationColumn]);
      }
    });

    return kxx;
  }

  private where(kx: any, where?: FindConditions<T> | FindChainingConditions<T>, orWhere?: boolean): any {
    /* eslint-disable no-prototype-builtins, @typescript-eslint/no-this-alias */
    let kxx = kx;

    Object.keys(where).forEach(ke => {
      if (ke === "$AND" || ke === "$OR") {
        const that = this;

        if (Array.isArray(where[ke])) {
          if (ke === "$AND") {
            where[ke].forEach(chWhere => {
              kxx = kx.andWhere(function () {
                that.where(this, chWhere, false);
              });
            });
          } else if (ke === "$OR") {
            where[ke].forEach(chWhere => {
              kxx = kx.orWhere(function () {
                that.where(this, chWhere, true);
              });
            });
          }
        } else {
          if (ke === "$AND") {
            kx.andWhere(function () {
              that.where(this, where[ke], false);
            });
          } else if (ke === "$OR") {
            kx.orWhere(function () {
              that.where(this, where[ke], true);
            });
          }
        }
      } else {
        const k = `${this.repositoryInfo.tableName}.${this.repositoryInfo.fields[ke].name}`;
        const v = where[ke];

        if (Array.isArray(v)) kxx = kxx.whereIn(k, v);
        else if (
          typeof v === "object" &&
          (v.hasOwnProperty(">=") ||
            v.hasOwnProperty(">") ||
            v.hasOwnProperty("<=") ||
            v.hasOwnProperty("<") ||
            v.hasOwnProperty("!=") ||
            v.hasOwnProperty("LIKE") ||
            v.hasOwnProperty("LIKE%") ||
            v.hasOwnProperty("%LIKE") ||
            v.hasOwnProperty("%LIKE%") ||
            v["$AND"] ||
            v["$OR"] ||
            typeof v["IS_NULL"] === "boolean" ||
            typeof v["IS_NOT_NULL"] === "boolean")
        ) {
          const that = this;

          kxx[orWhere ? "orWhere" : "andWhere"](function () {
            Object.keys(v).forEach(cond => {
              if (cond === "$AND" || cond === "$OR") {
                this[cond === "$OR" ? "orWhere" : "andWhere"](function () {
                  v[cond].forEach((vv: any) => {
                    that.where(this, { [ke]: vv }, cond === "$OR");
                  });
                });
              } else if (cond === "IS_NULL" || cond === "IS_NOT_NULL") {
                if (v["IS_NULL"] === true || v["IS_NOT_NULL"] === false) {
                  this[orWhere ? "orWhereNull" : "whereNull"](k);
                } else if (v["IS_NULL"] === false || v["IS_NOT_NULL"] === true) {
                  this[orWhere ? "orWhereNotNull" : "whereNotNull"](k);
                }
              } else if (cond === "LIKE" || cond === "%LIKE" || cond === "LIKE%" || cond === "%LIKE%") {
                if (cond === "LIKE") this[orWhere ? "orWhere" : "where"](k, "LIKE", v[cond]);
                else if (cond === "%LIKE") this[orWhere ? "orWhere" : "where"](k, "LIKE", `%${v[cond]}`);
                else if (cond === "LIKE%") this[orWhere ? "orWhere" : "where"](k, "LIKE", `${v[cond]}%`);
                else if (cond === "%LIKE%") this[orWhere ? "orWhere" : "where"](k, "LIKE", `%${v[cond]}%`);
              } else if (typeof v[cond] === "function") {
                this.whereRaw(`${k} ${cond} ${v[cond](k)}`);
              } else {
                this[orWhere ? "orWhere" : "where"](k, cond, v[cond]);
              }
            });
          });
        } else if (typeof v === "function") kxx = kxx[orWhere ? "orWhere" : "where"](this.scope.kx.raw(v(k)));
        else kxx = kxx[orWhere ? "orWhere" : "where"](k, v);
      }
    });

    return kxx;
  }

  private order(kx: any, order?: OrderCondition<T>): any {
    let kxx = kx;

    Object.keys(order).forEach(ke => {
      const k = `${this.repositoryInfo.tableName}.${this.repositoryInfo.fields[ke].name}`;
      const v = order[ke];

      if (typeof v === "function") {
        kxx = kx.orderByRaw(v(k));
      } else {
        kxx = kx.orderBy(k, v);
      }
    });

    return kxx;
  }

  private mapping(row: any, repositoryInfo?: RepositoryInfo, prefix?: string): T {
    const x = plainToClass(
      (repositoryInfo || this.repositoryInfo).target,
      Object.keys(row)
        .filter(e => !prefix || e.startsWith(`${prefix}${joinSeparator}`))
        .reduce((p, c) => {
          const col = !prefix ? c : c.substring(prefix.length + 1);

          if (!col.includes(joinSeparator)) {
            p[col] = row[c];
          } else {
            const [join] = col.split(joinSeparator);

            if (!p[join]) {
              p[join] = this.mapping(
                row,
                (repositoryInfo || this.repositoryInfo).oneToOneRelations[join].repository,
                !prefix ? join : `${prefix}_${join}`
              );
            }
          }

          return p;
        }, {})
    );

    return x;
  }
}
