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
        const [res] = await this.scope.kx.insert(this.entityInfo.columns.reduce((p, e) => {
            const key = this.entityInfo.fields[e].name;
            const val = ((v) => {
                if (typeof v === "function")
                    return this.scope.kx.raw(v(key));
                else if (!v && this.entityInfo.fields[e].default) {
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
    async findOne(options) {
        const [res] = await this.select(Object.assign(Object.assign({}, options), { limit: 1 }));
        return res;
    }
    find(options) {
        return this.select(options);
    }
    async select(options) {
        try {
            const selectColumns = options.select || this.entityInfo.columns;
            const select = selectColumns.map(e => this.entityInfo.fields[e].name);
            let kx = this.scope.kx.select(select).from(this.entityInfo.tableName);
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