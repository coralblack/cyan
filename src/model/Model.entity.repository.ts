/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import internal from "stream";
import { plainToClass } from "class-transformer";
import { Knex } from "knex";
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
  SaveOptions,
  StreamFunctions,
  UpdateBulkOptions,
  UpdateOptions,
} from "./Model.query";
import { Metadata } from "../core/Decorator";
import { TraceableError } from "../core/Error";
import { ClassType } from "../types";
import { hasOwnProperty } from "../util/builtin";

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
  private readonly kx: Knex;

  constructor(scope: TransactionScope | Knex, entity: ClassType<T>) {
    this.repositoryInfo = Repository.getRepositoryInfo(entity);
    this.kx = scope instanceof TransactionScope ? scope.kx : scope;
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

  async save(entity: T, options?: SaveOptions): Promise<InsertId> {
    try {
      const kx = options?.transaction.kx || this.kx;
      const [res] = await kx
        .insert(
          this.repositoryInfo.columns.reduce((p, e) => {
            const [key, val] = (() => {
              const column = this.repositoryInfo.fields[e];

              if (hasOwnProperty(column, "name")) {
                const key = column.name;
                const val = ((v): any => {
                  if (typeof v === "function") return kx.raw(v(key));
                  else if (v === undefined && column.default) {
                    return kx.raw(column.default(key));
                  } else return v;
                })(entity[e]);

                return [key, val];
              } else {
                if (hasOwnProperty(entity, e)) {
                  throw new Error(`Invalid Usage: Save with raw column not allowed. (${column.raw(this.repositoryInfo.tableName)})`);
                } else {
                  return [null, null];
                }
              }
            })();

            if (key === null) return p;
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

      const [[lid]] = await kx.raw("SELECT LAST_INSERT_ID() AS seq");

      return res || lid.seq;
    } catch (err) {
      throw TraceableError(err);
    }
  }

  async saveBulk(entities: Array<T>, options?: SaveOptions): Promise<InsertId[]> {
    try {
      const kx = options?.transaction.kx || this.kx;

      if (this.repositoryInfo.primaryColumns.length !== 1) {
        throw new Error("Not Supprted: SaveBulk with multiple primary columns. ");
      } else if (entities.find(e => !e[this.repositoryInfo.primaryColumns[0]])) {
        throw new Error("Not Supprted: SaveBulk with empty primary column value. ");
      }

      const insertedIds: InsertId[] = [];

      const newEntities = entities.map(entity => {
        return this.repositoryInfo.columns.reduce((p, column) => {
          const field = this.repositoryInfo.fields[column];
          const isPrimaryColumn = this.repositoryInfo.primaryColumns[0] === column;

          if (!field) {
            throw new Error(`Invalid Usage: Save with column(${column}) not allowed. `);
          }

          const [key, val] = (() => {
            if (!field) {
              return [null, null];
            } else if ("name" in field) {
              const key = field.name;
              const val = ((v): any => {
                if (typeof v === "function") return kx.raw(v(key));
                else if (v === undefined && field.default) {
                  return kx.raw(field.default(key));
                } else return v;
              })(entity[column]);

              return [key, val];
            } else {
              if (hasOwnProperty(entity, column)) {
                throw new Error(`Invalid Usage: Save with raw column not allowed. (${field.raw(this.repositoryInfo.tableName)})`);
              } else {
                return [null, null];
              }
            }
          })();

          if (key === null) return p;
          if (isPrimaryColumn) {
            insertedIds.push(val);
          }

          p[key] = val;

          return p;
        }, {});
      });

      await kx.insert(newEntities).into(this.repositoryInfo.tableName);

      return insertedIds;
    } catch (err) {
      throw TraceableError(err);
    }
  }

  async update(entity: T, options?: UpdateOptions<T>): Promise<number> {
    try {
      let kx = (options?.transaction.kx || this.kx).from(this.repositoryInfo.tableName);

      const conditions: FindConditions<T> = Object.assign({}, options?.where || {});

      this.repositoryInfo.primaryColumns.forEach(e => {
        conditions[e] = entity[e];
      });

      kx = this.where(kx, conditions);
      kx = kx.update(
        ((options?.update || this.repositoryInfo.columns) as any).reduce((p, e) => {
          const column = this.repositoryInfo.fields[e];

          if (hasOwnProperty(column, "name")) {
            p[column.name] = entity[e];
          } else {
            throw new Error(`Invalid Usage: Update with raw column not allowed. (${column.raw(this.repositoryInfo.tableName)})`);
          }
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

  async updateBulk(entities: Array<T>, options: UpdateBulkOptions<T>): Promise<number> {
    try {
      const kx = options?.transaction.kx || this.kx;
      const primaryColumn = this.repositoryInfo.primaryColumns[0];
      const primaryField = this.repositoryInfo.fields[primaryColumn];

      if (this.repositoryInfo.primaryColumns.length !== 1) {
        throw new Error("Not Supprted: updateBulk with multiple primary columns. ");
      } else if (entities.find(e => !e[primaryColumn])) {
        throw new Error("Not Supprted: updateBulk with empty primary column value. ");
      } else if (!options.update.length) {
        return 0;
      }

      const primaryFieldName = primaryField && "name" in primaryField ? primaryField.name : null;
      const updateFieldNames = (options.update as string[])
        .map(e => {
          const field = this.repositoryInfo.fields[e];

          return field && "name" in field ? field.name : null;
        })
        .filter(e => e);

      if (!primaryFieldName) {
        throw new Error(`Invalid Usage: UpdateBulk with primary column(${primaryColumn}) not allowed.`);
      } else if (updateFieldNames.length !== options.update.length) {
        throw new Error(`Invalid Usage: UpdateBulk with column(${options.update.join(", ")}) not allowed.`);
      }

      const entityIds = entities.map(e => e[primaryColumn]);
      const findWhere: FindConditions<T> = {};

      findWhere[primaryColumn] = entityIds;

      const ids = (await this.select({ where: findWhere, forUpdate: true, select: [primaryColumn as keyof T] })).map(e => e[primaryColumn]);
      const filteredEntities = entities.filter(e => ids.includes(e[primaryColumn]));
      const updatedEntities = filteredEntities.map(entity => {
        return this.repositoryInfo.columns.reduce(
          (p, column) => {
            const field = this.repositoryInfo.fields[column];

            if (!field) {
              throw new Error(`Invalid Usage: UpdateBulk with raw column(${column}) not allowed.`);
            } else if ("name" in field) {
              if (entity[column] === undefined) {
                throw new Error(`Invalid Usage: UpdateBulk with raw column(${column}) is undefined.`);
              }

              p[field.name] = entity[column];
            } else {
              throw new Error(`Invalid Usage: UpdateBulk with raw column not allowed. (${field.raw(this.repositoryInfo.tableName)})`);
            }
            return p;
          },
          { [primaryColumn]: entity[primaryColumn] }
        );
      });

      await kx.insert(updatedEntities).into(this.repositoryInfo.tableName).onConflict(primaryFieldName).merge(updateFieldNames);

      return updatedEntities.length;
    } catch (err) {
      throw TraceableError(err);
    }
  }

  async delete(entity: T, options?: DeleteOptions<T>): Promise<number> {
    try {
      let kx = (options?.transaction.kx || this.kx).from(this.repositoryInfo.tableName);

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
      const kx = options?.transaction.kx || this.kx;
      const page = Math.max(1, options && options.page ? options.page : 1);
      const rpp = Math.max(1, options && options.rpp ? options.rpp : 30);
      const limit = BigInt(rpp);
      const offset: bigint = (BigInt(page) - BigInt(1)) * limit;

      const count = (await this.where(kx.from(this.repositoryInfo.tableName), options.where || {}).count("* as cnt"))[0].cnt;

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

  streaming(options: FindOptions<T>): internal.PassThrough & AsyncIterable<T> {
    try {
      return this.prepareQuery(options).stream();
    } catch (err) {
      throw TraceableError(err);
    }
  }

  async streamAsync(options: FindOptions<T>, streamFn: StreamFunctions<T>): Promise<void> {
    try {
      const kx = this.prepareQuery(options);

      kx.stream(stream => {
        stream.on("data", row => streamFn.onData(this.mapping(row)));

        if (streamFn.onStreamEnd) {
          stream.on("end", () => streamFn.onStreamEnd());
        }
      });
    } catch (err) {
      throw TraceableError(err);
    }
  }

  private prepareQuery(options: FindOptions<T>): Knex.QueryBuilder {
    try {
      const knex = options?.transaction.kx || this.kx;
      const joinAliases: { [key: string]: string } = {};
      let kx = knex.from(this.repositoryInfo.tableName);

      const selectColumns: any[] = options.select || this.repositoryInfo.columns;
      const select = selectColumns
        .filter(x => this.repositoryInfo.columns.indexOf(x) !== -1)
        .map(alias => {
          const column = this.repositoryInfo.fields[alias];

          if (hasOwnProperty(column, "name")) {
            return `${this.repositoryInfo.tableName}.${column.name} as ${alias}`;
          } else {
            kx.select(knex.raw(`${column.raw(this.repositoryInfo.tableName)} as ${alias}`));
          }
        })
        .filter(x => x);

      kx = kx.select(select);

      if (typeof options.distinct === "boolean" && options.distinct) {
        kx.distinct(select);
      }

      if (options.forUpdate) {
        kx = kx.forUpdate();
      }

      // Join
      kx = this.join(kx, options.select, joinAliases);

      // Query
      if (options.where) {
        kx = this.where(kx, options.where);
      }

      const joinAliasesProp = Object.keys(joinAliases).reduce((p, e) => {
        p[`.${e.split(joinSeparator).join(".")}`] = joinAliases[e];
        return p;
      }, {});

      // Sort
      if (options.order) {
        const orderBy = Array.isArray(options.order) ? options.order : [options.order];

        for (let i = 0; i < orderBy.length; i++) {
          kx = this.order(kx, orderBy[i], joinAliasesProp);
        }
      }

      // Pagination
      if (options.offset) kx = kx.offset(String(options.offset) as any);
      if (options.limit) kx = kx.limit(String(options.limit) as any);

      if (options.debug) {
        // eslint-disable-next-line no-console
        console.log(">", kx.toSQL());
      }

      return kx;
    } catch (err) {
      throw TraceableError(err);
    }
  }

  private async select(options: FindOptions<T>): Promise<T[]> {
    try {
      const rows = await this.prepareQuery(options);

      if (!rows || !rows.length) return [];

      return rows.map((row: any) => this.mapping(row));
    } catch (err) {
      throw TraceableError(err);
    }
  }

  async count(options: CountOptions<T>): Promise<bigint> {
    try {
      let kx = (options?.transaction.kx || this.kx).count("* AS cnt").from(this.repositoryInfo.tableName);

      kx = this.join(kx, [], {});

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

  private joinWith(
    kx: any,
    rec: number,
    fromTable: string,
    propertyKey: string,
    to: RelationalRepositoryInfo,
    aliases: { [key: string]: string }
  ) {
    const kxx = kx;
    const fromColumns = to.options.name;
    const toFields = to.repository.fields;
    const toColumns = to.repository.primaryColumns;
    const toTableNameAlias = `${to.repository.tableName}_${rec}`;
    const toTable = `${to.repository.tableName} AS ${toTableNameAlias}`;
    const joinTableColumns = to.repository.columns.map(col => {
      const column = to.repository.fields[col];

      if (hasOwnProperty(column, "name")) {
        return `${toTableNameAlias}.${column.name} as ${propertyKey}${joinSeparator}${col}`;
      } else {
        throw new Error(`Invalid Usage: Join with raw column not allowed. (${column.raw(toTableNameAlias)})`);
      }
    });

    // Assign alias
    aliases[propertyKey] = toTableNameAlias;

    if (fromColumns.length !== toColumns.length) {
      throw new Error(
        `Invalid Relation: Joining columns are not matched (${(fromColumns as string[]).join(",")} -> ${toColumns.join(",")})`
      );
    }

    kxx.leftOuterJoin(toTable, function () {
      for (let i = 0; i < fromColumns.length; i++) {
        const column = toFields[toColumns[i]];

        if (hasOwnProperty(column, "name")) {
          this.on(`${fromTable}.${fromColumns[i]}`, `${toTableNameAlias}.${column.name}`);
        } else {
          throw new Error(`Invalid Usage: Join with raw column not allowed. (${column.raw(fromTable)})`);
        }
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
        to.repository.oneToOneRelations[relationColumn],
        aliases
      );
    });

    return kxx;
  }

  private join(kx: any, selectColumns: Array<keyof T>, aliases: { [key: string]: string }): any {
    const kxx = kx;
    let idx = 0;

    this.repositoryInfo.oneToOneRelationColumns.forEach(relationColumn => {
      if (!selectColumns || selectColumns.indexOf(relationColumn as keyof T) !== -1) {
        this.joinWith(
          kxx,
          ++idx,
          this.repositoryInfo.tableName,
          relationColumn,
          this.repositoryInfo.oneToOneRelations[relationColumn],
          aliases
        );
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
        const column = this.repositoryInfo.fields[ke];

        const isConditional = (v: any) => typeof v === "object" && (v["$AND"] || v["$OR"]);
        const isManipulatable = (v: any) =>
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
            typeof v["IS_NULL"] === "boolean" ||
            typeof v["IS_NOT_NULL"] === "boolean");

        const raw = !!hasOwnProperty(column, "raw");
        const k = hasOwnProperty(column, "name")
          ? `${this.repositoryInfo.tableName}.${column.name}`
          : column.raw(this.repositoryInfo.tableName);
        const v = where[ke];

        if (Array.isArray(v)) {
          if (!raw) {
            kxx.whereIn(k, v);
          } else {
            if (v.length > 0) kxx.whereRaw(`${k} IN (?)`, [v]);
            else kxx.whereRaw("false");
          }
        } else if (isManipulatable(v) || isConditional(v)) {
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
                const res = v[cond](k);

                if (typeof res === "object") {
                  this.whereRaw(`${k} ${cond} ${res.operand}`, res.bindings);
                } else {
                  this.whereRaw(`${k} ${cond} ${res}`);
                }
              } else {
                this[orWhere ? "orWhereRaw" : "whereRaw"](`${k} ${cond} ?`, [v[cond]]);
              }
            });
          });
        } else if (typeof v === "function") {
          kxx[orWhere ? "orWhere" : "where"](kx.raw(v(k)));
        } else {
          if (!raw) {
            kxx[orWhere ? "orWhere" : "where"](k, v);
          } else {
            kxx[orWhere ? "orWhere" : "andWhere"](function () {
              this.whereRaw(`${k} = ?`, [v]);
            });
          }
        }
        /* else {
          const k = column.raw(this.repositoryInfo.tableName);
          const v = where[ke];

          if (Array.isArray(v)) {
            kxx[orWhere ? "orWhere" : "andWhere"](function () {
              if (v.length > 0) this.whereRaw(`${k} IN (?)`, [v]);
              else this.whereRaw("false");
            });
          } else if (isConditional(v)) {
            throw new Error(`Invalid Usage: Query with raw column not supported. (${column.raw(this.repositoryInfo.tableName)})`);
          } else {
            // const that = this;

            kxx[orWhere ? "orWhere" : "andWhere"](function () {
              this.whereRaw(`${k} = ?`, [v]);
            });
          }
        } */
      }
    });

    return kxx;
  }

  private order(kx: any, orderCond: OrderCondition<T>, joinAliases: { [key: string]: string }): any {
    const order = typeof orderCond === "function" ? [orderCond] : orderCond;
    let kxx = kx;

    Object.keys(order).forEach(ke => {
      const column = this.repositoryInfo.fields[ke];
      const oto = !column && this.repositoryInfo.oneToOneRelations[ke];
      const v = order[ke];

      if (oto) {
        throw new Error("Invalid Usage: Sorting by joining column must be used delegated function.)");
      } else if (!column && typeof v === "function") {
        kxx = kx.orderByRaw(v(joinAliases));
      } else if (hasOwnProperty(column, "name")) {
        const k = `${this.repositoryInfo.tableName}.${column.name}`;

        if (typeof v === "function") {
          kxx = kx.orderByRaw(v(k));
        } else {
          kxx = kx.orderBy(k, v);
        }
      } else {
        const k = column.raw(this.repositoryInfo.tableName);

        kxx = kx.orderByRaw(`${k} ${v}`);
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
