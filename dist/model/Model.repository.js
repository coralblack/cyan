"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = exports.symEntityInfo = void 0;
const class_transformer_1 = require("class-transformer");
const Model_entity_1 = require("./Model.entity");
const Decorator_1 = require("../core/Decorator");
const Error_1 = require("../core/Error");
exports.symEntityInfo = Symbol();
class Repository {
    constructor(scope, entity) {
        this.scope = scope;
        this.entity = entity;
        this.entityInfo = Repository.getEntityInfo(entity);
    }
    static getEntityInfo(entity) {
        if (entity[exports.symEntityInfo])
            return entity[exports.symEntityInfo];
        const metadata = Decorator_1.Metadata.getStorage().entities.find(e => e.target === entity);
        const columns = Decorator_1.Metadata.getStorage().entityColumns.filter(e => e.target === entity);
        if (!metadata) {
            throw new Error(`Invalid Repository: No Decorated Entity (${entity.name})`);
        }
        else if (!columns.length) {
            throw new Error(`Invalid Repository: No Decorated Columns (${entity.name})`);
        }
        const info = {
            target: metadata.target,
            tableName: metadata.options.name,
            columns: columns.map(e => e.propertyKey),
            fields: columns.reduce((p, e) => { p[e.propertyKey] = e.options; return p; }, {}),
            primaryColumns: columns.filter(e => e.type === Model_entity_1.EntityColumnType.Primary).map(e => e.propertyKey),
            criteriaColumns: columns.filter(e => e.type === Model_entity_1.EntityColumnType.Primary).map(e => e.propertyKey),
        };
        entity[exports.symEntityInfo] = info;
        return info;
    }
    async save(entity) {
        try {
            const [res] = await this.scope.kx.insert(this.entityInfo.columns.reduce((p, e) => {
                const key = this.entityInfo.fields[e].name;
                const val = ((v) => {
                    if (typeof v === "function")
                        return this.scope.kx.raw(v(key));
                    else if (v === undefined && this.entityInfo.fields[e].default) {
                        return this.scope.kx.raw(this.entityInfo.fields[e].default(key));
                    }
                    else
                        return v;
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
        catch (err) {
            throw Error_1.TraceableError(err);
        }
    }
    async update(entity, options) {
        try {
            let kx = this.scope.kx.from(this.entityInfo.tableName);
            const conditions = Object.assign({}, (options === null || options === void 0 ? void 0 : options.where) || {});
            this.entityInfo.primaryColumns.forEach(e => {
                conditions[e] = entity[e];
            });
            kx = this.where(kx, conditions);
            kx = kx.update(((options === null || options === void 0 ? void 0 : options.update) || this.entityInfo.columns).reduce((p, e) => {
                p[this.entityInfo.fields[e].name] = entity[e];
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
    async delete(entity, options) {
        try {
            let kx = this.scope.kx.from(this.entityInfo.tableName);
            const conditions = Object.assign({}, (options === null || options === void 0 ? void 0 : options.where) || {});
            this.entityInfo.primaryColumns.forEach(e => {
                conditions[e] = entity[e];
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
    async select(options) {
        try {
            const selectColumns = options.select || this.entityInfo.columns;
            const select = selectColumns.map(e => this.entityInfo.fields[e].name);
            let kx = this.scope.kx.select(select).from(this.entityInfo.tableName);
            if (options.where) {
                kx = this.where(kx, options.where);
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
            return rows.map((e) => this.mapping(selectColumns, e));
        }
        catch (err) {
            throw Error_1.TraceableError(err);
        }
    }
    where(kx, where) {
        let kxx = kx;
        Object.keys(where).forEach(ke => {
            const k = this.entityInfo.fields[ke].name;
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
    mapping(select, row) {
        const x = class_transformer_1.plainToClass(this.entityInfo.target, select.reduce((p, e) => {
            p[e] = row[this.entityInfo.fields[e].name];
            return p;
        }, {}));
        return x;
    }
}
exports.Repository = Repository;
//# sourceMappingURL=Model.repository.js.map