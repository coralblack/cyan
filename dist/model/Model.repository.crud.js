"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudRepository = exports.symRepositoryInfo = void 0;
const class_transformer_1 = require("class-transformer");
const Model_relation_entity_1 = require("./Model.relation.entity");
const Model_repository_1 = require("./Model.repository");
const Decorator_1 = require("../core/Decorator");
const Error_1 = require("../core/Error");
exports.symRepositoryInfo = Symbol();
class CrudRepository {
    constructor(scope, entity) {
        this.scope = scope;
        this.repositoryInfo = CrudRepository.getRepositoryInfo(entity);
    }
    static getRepositoryInfo(repository) {
        if (repository[exports.symRepositoryInfo])
            return repository[exports.symRepositoryInfo];
        const metadata = Decorator_1.Metadata.getStorage().repositories.find(e => e.target === repository);
        const columns = Decorator_1.Metadata.getStorage().repositoryColumns.filter(e => e.target === repository);
        if (!metadata) {
            throw new Error(`Invalid Repository: No Decorated Repository (${repository.name})`);
        }
        else if (!columns.length) {
            throw new Error(`Invalid Repository: No Decorated Columns (${repository.name})`);
        }
        const relationColumns = Decorator_1.Metadata.getStorage().relationEntityColumns.filter(e => e.target === repository);
        const relationColumnTable = relationColumns.reduce((p, col) => {
            const table = Decorator_1.Metadata.getStorage().repositories.find(e => col.table === e.target);
            const columns = Decorator_1.Metadata.getStorage().repositoryColumns.filter(e => col.table === e.target);
            const relationEntity = {
                name: table.options.name,
                columns: columns.map(e => e.propertyKey),
                fields: columns.reduce((p, e) => { p[e.propertyKey] = e.options; return p; }, {}),
            };
            p[col.propertyKey] = relationEntity;
            return p;
        }, {});
        const info = {
            target: metadata.target,
            tableName: metadata.options.name,
            columns: columns.map(e => e.propertyKey),
            relationColumns: relationColumns.map(e => e.propertyKey),
            relationColumnTable: relationColumnTable,
            relationColumnType: relationColumns.reduce((p, e) => { p[e.propertyKey] = e.type; return p; }, {}),
            relationColumnOptions: relationColumns.reduce((p, e) => { p[e.propertyKey] = e.options; return p; }, {}),
            fields: columns.reduce((p, e) => { p[e.propertyKey] = e.options; return p; }, {}),
            primaryColumns: columns.filter(e => e.type === Model_repository_1.RepositoryColumnType.Primary).map(e => e.propertyKey),
            criteriaColumns: columns.filter(e => e.type === Model_repository_1.RepositoryColumnType.Primary).map(e => e.propertyKey),
        };
        repository[exports.symRepositoryInfo] = info;
        return info;
    }
    async save(repository) {
        try {
            const [res] = await this.scope.kx.insert(this.repositoryInfo.columns.reduce((p, e) => {
                const key = this.repositoryInfo.fields[e].name;
                const val = ((v) => {
                    if (typeof v === "function")
                        return this.scope.kx.raw(v(key));
                    else if (v === undefined && this.repositoryInfo.fields[e].default) {
                        return this.scope.kx.raw(this.repositoryInfo.fields[e].default(key));
                    }
                    else
                        return v;
                })(repository[e]);
                p[key] = val;
                return p;
            }, {})).into(this.repositoryInfo.tableName);
            if (this.repositoryInfo.primaryColumns.length === 1) {
                const id = repository[this.repositoryInfo.primaryColumns[0]];
                if (id && typeof id !== "function") {
                    return repository[this.repositoryInfo.primaryColumns[0]];
                }
            }
            const [[lid]] = await this.scope.kx.raw("SELECT LAST_INSERT_ID() AS seq");
            return res || lid.seq;
        }
        catch (err) {
            throw Error_1.TraceableError(err);
        }
    }
    async update(repository, options) {
        try {
            let kx = this.scope.kx.from(this.repositoryInfo.tableName);
            const conditions = Object.assign({}, (options === null || options === void 0 ? void 0 : options.where) || {});
            this.repositoryInfo.primaryColumns.forEach(e => {
                conditions[e] = repository[e];
            });
            kx = this.where(kx, conditions);
            kx = kx.update(((options === null || options === void 0 ? void 0 : options.update) || this.repositoryInfo.columns).reduce((p, e) => {
                p[this.repositoryInfo.fields[e].name] = repository[e];
                return p;
            }, {}));
            if (options === null || options === void 0 ? void 0 : options.debug) {
                console.log(">", kx.toSQL());
            }
            const affected = await kx;
            return Number(affected);
        }
        catch (err) {
            throw Error_1.TraceableError(err);
        }
    }
    async delete(repository, options) {
        try {
            let kx = this.scope.kx.from(this.repositoryInfo.tableName);
            const conditions = Object.assign({}, (options === null || options === void 0 ? void 0 : options.where) || {});
            this.repositoryInfo.primaryColumns.forEach(e => {
                conditions[e] = repository[e];
            });
            kx = this.where(kx, conditions);
            kx = kx.del();
            if (options === null || options === void 0 ? void 0 : options.debug) {
                console.log(">", kx.toSQL());
            }
            const affected = await kx;
            return Number(affected);
        }
        catch (err) {
            throw Error_1.TraceableError(err);
        }
    }
    async findOne(options) {
        try {
            const [res] = await this.select(Object.assign(Object.assign({}, options), { limit: 1 }));
            return res || null;
        }
        catch (err) {
            throw Error_1.TraceableError(err);
        }
    }
    async find(options) {
        try {
            const res = await this.select(options);
            return res;
        }
        catch (err) {
            throw Error_1.TraceableError(err);
        }
    }
    async pagination(options) {
        try {
            const page = Math.max(1, options && options.page ? options.page : 1);
            const rpp = Math.max(1, options && options.rpp ? options.rpp : 30);
            const limit = BigInt(rpp);
            const offset = (BigInt(page) - BigInt(1)) * limit;
            const count = (await this
                .where(this.scope.kx.from(this.repositoryInfo.tableName), options.where || {})
                .count("* as cnt"))[0].cnt;
            const items = await this.find(Object.assign(Object.assign({}, options), { limit, offset }));
            return {
                page,
                rpp,
                count,
                items,
            };
        }
        catch (err) {
            throw Error_1.TraceableError(err);
        }
    }
    async select(options) {
        try {
            const selectColumns = options.select || this.repositoryInfo.columns;
            const select = selectColumns.map(column => `${this.repositoryInfo.tableName}.${this.repositoryInfo.fields[column].name} as ${column}`);
            let kx = this.scope.kx.select(select).from(this.repositoryInfo.tableName);
            kx = this.join(kx);
            if (options.where) {
                kx = this.where(kx, options.where);
            }
            if (options.order) {
                kx = this.order(kx, options.order);
            }
            if (options.offset)
                kx = kx.offset(String(options.offset));
            if (options.limit)
                kx = kx.limit(String(options.limit));
            if (options.debug) {
                console.log(">", kx.toSQL());
            }
            const rows = await kx;
            if (!rows || !rows.length)
                return [];
            return rows.map((row) => this.mapping(row));
        }
        catch (err) {
            throw Error_1.TraceableError(err);
        }
    }
    join(kx) {
        const kxx = kx;
        this.repositoryInfo.relationColumns.forEach(relationColumn => {
            const tableName = this.repositoryInfo.tableName;
            const relationType = this.repositoryInfo.relationColumnType[relationColumn];
            const relationColumnOptions = this.repositoryInfo.relationColumnOptions[relationColumn];
            const joinTable = this.repositoryInfo.relationColumnTable[relationColumn];
            if (relationType === Model_relation_entity_1.RelationEntityColumnType.OneToOne) {
                const relationColumnName = relationColumnOptions.name;
                const referencedColumnName = relationColumnOptions.referencedColumnName || relationColumnOptions.name;
                const joinTableColumns = joinTable.columns.map(joinTableColumn => `${joinTable.name}.${joinTable.fields[joinTableColumn].name} as ${relationColumn}_${joinTableColumn}`);
                kxx.leftOuterJoin(joinTable.name, `${tableName}.${relationColumnName}`, `${joinTable.name}.${referencedColumnName}`);
                kxx.select(joinTableColumns);
            }
        });
        return kxx;
    }
    where(kx, where) {
        let kxx = kx;
        Object.keys(where).forEach(ke => {
            const k = `${this.repositoryInfo.tableName}.${this.repositoryInfo.fields[ke].name}`;
            const v = where[ke];
            if (Array.isArray(v))
                kxx = kxx.whereIn(k, v);
            else if (typeof v === "object" && (v[">="] || v[">"] || v["<="] || v["<"] || typeof v["IS_NULL"] === "boolean" || typeof v["IS_NOT_NULL"] === "boolean")) {
                kxx.andWhere(function () {
                    Object.keys(v).forEach((condition) => {
                        if (condition === "IS_NULL" || condition === "IS_NOT_NULL") {
                            if (v["IS_NULL"] === true || v["IS_NOT_NULL"] === false) {
                                this.whereNull(k);
                            }
                            else if (v["IS_NULL"] === false || v["IS_NOT_NULL"] === true) {
                                this.whereNotNull(k);
                            }
                        }
                        else if (typeof v[condition] === "function") {
                            this.whereRaw(`${k} ${condition} ${v[condition](k)}`);
                        }
                        else {
                            this.where(k, condition, v[condition]);
                        }
                    });
                });
            }
            else if (typeof v === "function")
                kxx = kxx.where(this.scope.kx.raw(v(k)));
            else
                kxx = kxx.where(k, v);
        });
        return kxx;
    }
    order(kx, order) {
        let kxx = kx;
        Object.keys(order).forEach(ke => {
            const k = `${this.repositoryInfo.tableName}.${this.repositoryInfo.fields[ke].name}`;
            const v = order[ke];
            if (typeof v === "function") {
                kxx = kx.orderByRaw(v(k));
            }
            else {
                kxx = kx.orderBy(k, v);
            }
        });
        return kxx;
    }
    mapping(row) {
        const x = class_transformer_1.plainToClass(this.repositoryInfo.target, Object.keys(row).reduce((p, col) => {
            const arr = col.split("_");
            if (arr.length === 1) {
                p[col] = row[col];
            }
            else if (arr.length === 2) {
                p[arr[0]] = p[arr[0]] || {};
                p[arr[0]][arr[1]] = row[col];
            }
            else if (arr.length === 3) {
                p[arr[0]] = p[arr[0]] || {};
                p[arr[0]][arr[1]] = p[arr[0]][arr[1]] || {};
                p[arr[0]][arr[1]][arr[2]] = row[col];
            }
            return p;
        }, {}));
        return x;
    }
}
exports.CrudRepository = CrudRepository;
//# sourceMappingURL=Model.repository.crud.js.map