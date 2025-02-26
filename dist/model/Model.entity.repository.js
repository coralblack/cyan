"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = exports.symRepositoryInfo = void 0;
const class_transformer_1 = require("class-transformer");
const Model_connection_1 = require("./Model.connection");
const Model_entity_1 = require("./Model.entity");
const Model_entity_relation_1 = require("./Model.entity.relation");
const Decorator_1 = require("../core/Decorator");
const Error_1 = require("../core/Error");
const builtin_1 = require("../util/builtin");
const joinSeparator = "_";
exports.symRepositoryInfo = Symbol();
class Repository {
    constructor(scopeOrKnex, entity) {
        this.repositoryInfo = Repository.getRepositoryInfo(entity);
        this.kx = scopeOrKnex instanceof Model_connection_1.TransactionScope ? scopeOrKnex.kx : scopeOrKnex;
    }
    static getRepositoryInfo(entity) {
        var _a;
        if (entity[exports.symRepositoryInfo])
            return entity[exports.symRepositoryInfo];
        const info = {};
        entity[exports.symRepositoryInfo] = info;
        const metadata = Decorator_1.Metadata.getStorage().entities.find(e => e.target === entity);
        const columns = Decorator_1.Metadata.getStorage().entityColumns.filter(e => e.target === entity);
        const relations = Decorator_1.Metadata.getStorage().entityRelations.filter(e => e.target === entity);
        if (!metadata) {
            throw new Error(`Invalid Repository: No Decorated Entity (${entity.name})`);
        }
        else if (!columns.length) {
            throw new Error(`Invalid Repository: No Decorated Columns (${entity.name})`);
        }
        (info.target = metadata.target),
            (info.tableName = (_a = metadata.options) === null || _a === void 0 ? void 0 : _a.name),
            (info.columns = columns.map(e => e.propertyKey)),
            (info.fields = columns.reduce((p, e) => {
                p[e.propertyKey] = e.options;
                return p;
            }, {})),
            (info.primaryColumns = columns.filter(e => e.type === Model_entity_1.EntityColumnType.Primary).map(e => e.propertyKey)),
            (info.criteriaColumns = columns.filter(e => e.type === Model_entity_1.EntityColumnType.Primary).map(e => e.propertyKey)),
            (info.oneToOneRelationColumns = relations.filter(e => e.type === Model_entity_relation_1.EntityRelationType.OneToOne).map(e => e.propertyKey)),
            (info.oneToOneRelations = relations
                .filter(e => e.type === Model_entity_relation_1.EntityRelationType.OneToOne)
                .reduce((output, relation) => {
                output[relation.propertyKey] = {
                    options: Object.assign(Object.assign({}, relation.options), { name: Array.isArray(relation.options.name) ? relation.options.name : [relation.options.name] }),
                    repository: Repository.getRepositoryInfo(relation.options.target),
                };
                return output;
            }, {}));
        return info;
    }
    async save(entity, trx) {
        try {
            const kx = (trx === null || trx === void 0 ? void 0 : trx.kx) || this.kx;
            const [res] = await kx
                .insert(this.repositoryInfo.columns.reduce((output, columnName) => {
                const [key, val] = (() => {
                    const column = this.repositoryInfo.fields[columnName];
                    if ("name" in column) {
                        const key = column.name;
                        const val = ((v) => {
                            if (typeof v === "function")
                                return kx.raw(v(key));
                            else if (v === undefined && column && "default" in column && column.default) {
                                return kx.raw(column.default(key));
                            }
                            else
                                return v;
                        })(entity[columnName]);
                        return [key, val];
                    }
                    else {
                        if ((0, builtin_1.hasOwnProperty)(entity, columnName)) {
                            throw new Error(`Invalid Usage: Save with raw column not allowed. (${column.raw(this.repositoryInfo.tableName)})`);
                        }
                        else {
                            return [null, null];
                        }
                    }
                })();
                if (key === null)
                    return output;
                output[key] = val;
                return output;
            }, {}))
                .into(this.repositoryInfo.tableName);
            if (this.repositoryInfo.primaryColumns.length === 1) {
                const id = entity[this.repositoryInfo.primaryColumns[0]];
                if (id && typeof id !== "function") {
                    return entity[this.repositoryInfo.primaryColumns[0]];
                }
            }
            const [[lid]] = await kx.raw("SELECT LAST_INSERT_ID() AS seq");
            return res || lid.seq;
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async saveBulk(entities, trx) {
        try {
            const kx = (trx === null || trx === void 0 ? void 0 : trx.kx) || this.kx;
            if (this.repositoryInfo.primaryColumns.length !== 1) {
                throw new Error("Not Supprted: SaveBulk with multiple primary columns. ");
            }
            else if (entities.find(e => !e[this.repositoryInfo.primaryColumns[0]])) {
                throw new Error("Not Supprted: SaveBulk with empty primary column value. ");
            }
            const insertedIds = [];
            const newEntities = entities.map(entity => {
                return this.repositoryInfo.columns.reduce((output, column) => {
                    const field = this.repositoryInfo.fields[column];
                    const isPrimaryColumn = this.repositoryInfo.primaryColumns[0] === column;
                    if (!field) {
                        throw new Error(`Invalid Usage: Save with column(${String(column)}) not allowed. `);
                    }
                    const [key, val] = (() => {
                        if (!field) {
                            return [null, null];
                        }
                        else if ("name" in field) {
                            const key = field.name;
                            const val = ((v) => {
                                if (typeof v === "function")
                                    return kx.raw(v(key));
                                else if (v === undefined && field.default) {
                                    return kx.raw(field.default(key));
                                }
                                else
                                    return v;
                            })(entity[column]);
                            return [key, val];
                        }
                        else {
                            if ((0, builtin_1.hasOwnProperty)(entity, column)) {
                                throw new Error(`Invalid Usage: Save with raw column not allowed. (${field.raw(this.repositoryInfo.tableName)})`);
                            }
                            else {
                                return [null, null];
                            }
                        }
                    })();
                    if (key === null)
                        return output;
                    if (isPrimaryColumn) {
                        insertedIds.push(val);
                    }
                    output[key] = val;
                    return output;
                }, {});
            });
            await kx.insert(newEntities).into(this.repositoryInfo.tableName);
            return insertedIds;
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async update(entity, options, trx) {
        try {
            let kx = ((trx === null || trx === void 0 ? void 0 : trx.kx) || this.kx).from(this.repositoryInfo.tableName);
            const conditions = Object.assign({}, (options === null || options === void 0 ? void 0 : options.where) || {});
            this.repositoryInfo.primaryColumns.forEach(e => {
                conditions[e] = entity[e];
            });
            kx = this.where(kx, conditions);
            kx = kx.update(((options === null || options === void 0 ? void 0 : options.update) || this.repositoryInfo.columns).reduce((output, columnName) => {
                const column = this.repositoryInfo.fields[columnName];
                if ("name" in column) {
                    output[column.name] = entity[columnName];
                }
                else {
                    throw new Error(`Invalid Usage: Update with raw column not allowed. (${column.raw(this.repositoryInfo.tableName)})`);
                }
                return output;
            }, {}));
            if (options === null || options === void 0 ? void 0 : options.debug) {
                console.log(">", kx.toSQL());
            }
            const affected = await kx;
            return Number(affected);
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async updateBulk(entities, options, trx) {
        try {
            const kx = (trx === null || trx === void 0 ? void 0 : trx.kx) || this.kx;
            const primaryColumn = this.repositoryInfo.primaryColumns[0];
            const primaryField = this.repositoryInfo.fields[primaryColumn];
            if (this.repositoryInfo.primaryColumns.length !== 1) {
                throw new Error("Not Supprted: updateBulk with multiple primary columns. ");
            }
            else if (entities.find(e => !e[primaryColumn])) {
                throw new Error("Not Supprted: updateBulk with empty primary column value. ");
            }
            else if (!options.update.length) {
                return 0;
            }
            const primaryFieldName = primaryField && "name" in primaryField ? primaryField.name : null;
            const updateFieldNames = options.update
                .map(e => {
                const field = this.repositoryInfo.fields[e];
                return field && "name" in field ? field.name : null;
            })
                .filter(e => e);
            if (!primaryFieldName) {
                throw new Error(`Invalid Usage: UpdateBulk with primary column(${String(primaryColumn)}) not allowed.`);
            }
            else if (updateFieldNames.length !== options.update.length) {
                throw new Error(`Invalid Usage: UpdateBulk with column(${options.update.join(", ")}) not allowed.`);
            }
            const entityIds = entities.map(e => e[primaryColumn]);
            const findWhere = {};
            findWhere[primaryColumn] = entityIds;
            const ids = (await this.select({ where: findWhere, forUpdate: true, select: [primaryColumn] }, trx)).map(e => e[primaryColumn]);
            const filteredEntities = entities.filter(e => ids.includes(e[primaryColumn]));
            const updatedEntities = filteredEntities.map(entity => {
                return this.repositoryInfo.columns.reduce((p, column) => {
                    const field = this.repositoryInfo.fields[column];
                    if (!field) {
                        throw new Error(`Invalid Usage: UpdateBulk with raw column(${String(column)}) not allowed.`);
                    }
                    else if ("name" in field) {
                        if (entity[column] === undefined) {
                            throw new Error(`Invalid Usage: UpdateBulk with raw column(${String(column)}) is undefined.`);
                        }
                        p[field.name] = entity[column];
                    }
                    else {
                        throw new Error(`Invalid Usage: UpdateBulk with raw column not allowed. (${field.raw(this.repositoryInfo.tableName)})`);
                    }
                    return p;
                }, {});
            });
            await kx.insert(updatedEntities).into(this.repositoryInfo.tableName).onConflict(primaryFieldName).merge(updateFieldNames);
            return updatedEntities.length;
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async upsert(entity, options, trx) {
        try {
            const kx = (trx === null || trx === void 0 ? void 0 : trx.kx) || this.kx;
            const primaryColumn = this.repositoryInfo.primaryColumns[0];
            const newEntity = this.repositoryInfo.columns.reduce((p, column) => {
                const field = this.repositoryInfo.fields[column];
                const [key, val] = (() => {
                    if (!field) {
                        return [null, null];
                    }
                    else if ("name" in field) {
                        const key = field.name;
                        const val = ((v) => {
                            if (typeof v === "function")
                                return kx.raw(v(key));
                            else if (v === undefined && field.default) {
                                return kx.raw(field.default(key));
                            }
                            else
                                return v;
                        })(entity[column]);
                        return [key, val];
                    }
                    else {
                        if ((0, builtin_1.hasOwnProperty)(entity, column)) {
                            throw new Error(`Invalid Usage: Save with raw column not allowed. (${field.raw(this.repositoryInfo.tableName)})`);
                        }
                        else {
                            return [null, null];
                        }
                    }
                })();
                if (key === null)
                    return p;
                p[key] = val;
                return p;
            }, {});
            const updateFieldNames = (() => {
                const getFieldName = (fieldKey) => {
                    const field = this.repositoryInfo.fields[fieldKey];
                    return field && "name" in field ? field.name : null;
                };
                return options.update.map(getFieldName).filter((name) => name !== null);
            })();
            const kxQuery = kx.insert(newEntity).into(this.repositoryInfo.tableName).onConflict().merge(updateFieldNames);
            const [res] = await kxQuery;
            if (options === null || options === void 0 ? void 0 : options.debug) {
                console.log(">", kxQuery.toSQL());
            }
            if (this.repositoryInfo.primaryColumns.length === 1) {
                const id = entity[primaryColumn];
                if (id && typeof id !== "function") {
                    return entity[primaryColumn];
                }
            }
            const [[lid]] = await kx.raw("SELECT LAST_INSERT_ID() AS seq");
            return res || lid.seq;
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async delete(entity, options, trx) {
        try {
            let kx = ((trx === null || trx === void 0 ? void 0 : trx.kx) || this.kx).from(this.repositoryInfo.tableName);
            const conditions = Object.assign({}, (options === null || options === void 0 ? void 0 : options.where) || {});
            this.repositoryInfo.primaryColumns.forEach(e => {
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
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async findOne(options, trx) {
        try {
            const [res] = await this.select(Object.assign(Object.assign({}, options), { limit: 1 }), trx);
            return res || null;
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async find(options, trx) {
        try {
            const res = await this.select(options, trx);
            return res;
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async pagination(options, trx) {
        try {
            const kx = (trx === null || trx === void 0 ? void 0 : trx.kx) || this.kx;
            const page = Math.max(1, options && options.page ? options.page : 1);
            const rpp = Math.max(1, options && options.rpp ? options.rpp : 30);
            const limit = BigInt(rpp);
            const offset = (BigInt(page) - BigInt(1)) * limit;
            const count = (await this.where(kx.from(this.repositoryInfo.tableName), (options === null || options === void 0 ? void 0 : options.where) || {}).count("* as cnt"))[0].cnt;
            const items = await this.find(Object.assign(Object.assign({}, options), { limit, offset }), trx);
            return {
                page,
                rpp,
                count,
                items,
            };
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    streaming(options, trx) {
        try {
            return this.prepareQuery(options, trx).stream();
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async streamAsync(options, streamFn, trx) {
        try {
            const kx = this.prepareQuery(options, trx);
            kx.stream(stream => {
                stream.on("data", row => streamFn.onData(this.mapping(row)));
                if (streamFn.onStreamEnd) {
                    stream.on("end", () => { var _a; return (_a = streamFn.onStreamEnd) === null || _a === void 0 ? void 0 : _a.call(streamFn); });
                }
            });
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    prepareQuery(options, trx) {
        try {
            const knex = (trx === null || trx === void 0 ? void 0 : trx.kx) || this.kx;
            const joinAliases = {};
            let kx = knex.from(this.repositoryInfo.tableName);
            const selectColumns = (options === null || options === void 0 ? void 0 : options.select) || this.repositoryInfo.columns;
            const select = selectColumns
                .filter(x => this.repositoryInfo.columns.indexOf(x) !== -1)
                .map(alias => {
                const column = this.repositoryInfo.fields[alias];
                if ((0, builtin_1.hasOwnProperty)(column, "name")) {
                    return `${this.repositoryInfo.tableName}.${column.name} as ${alias}`;
                }
                else {
                    kx.select(knex.raw(`${column.raw(this.repositoryInfo.tableName)} as ${alias}`));
                }
            })
                .filter(x => x)
                .map(e => e);
            kx = kx.select(select);
            if (typeof (options === null || options === void 0 ? void 0 : options.distinct) === "boolean" && options.distinct) {
                kx.distinct(select);
            }
            if (options === null || options === void 0 ? void 0 : options.forUpdate) {
                kx = kx.forUpdate();
            }
            kx = this.join(kx, options === null || options === void 0 ? void 0 : options.select, joinAliases);
            if (options === null || options === void 0 ? void 0 : options.where) {
                kx = this.where(kx, options.where);
            }
            const joinAliasesProp = Object.keys(joinAliases).reduce((output, joinAliasKey) => {
                output[`.${joinAliasKey.split(joinSeparator).join(".")}`] = joinAliases[joinAliasKey];
                return output;
            }, {});
            if (options === null || options === void 0 ? void 0 : options.order) {
                const orderBy = Array.isArray(options.order) ? options.order : [options.order];
                for (let i = 0; i < orderBy.length; i++) {
                    kx = this.order(kx, orderBy[i], joinAliasesProp);
                }
            }
            if (options === null || options === void 0 ? void 0 : options.offset)
                kx = kx.offset(String(options.offset));
            if (options === null || options === void 0 ? void 0 : options.limit)
                kx = kx.limit(String(options.limit));
            if (options === null || options === void 0 ? void 0 : options.debug) {
                console.log(">", kx.toSQL());
            }
            return kx;
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async select(options, trx) {
        try {
            const rows = await this.prepareQuery(options, trx);
            if (!rows || !rows.length)
                return [];
            return rows.map((row) => this.mapping(row));
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async count(options, trx) {
        try {
            let kx = ((trx === null || trx === void 0 ? void 0 : trx.kx) || this.kx).count("* AS cnt").from(this.repositoryInfo.tableName);
            kx = this.join(kx, [], {});
            if (options.where) {
                kx = this.where(kx, options.where);
            }
            if (options.debug) {
                console.log(">", kx.toSQL());
            }
            const res = await kx;
            if (!res || !res.length)
                return BigInt(0);
            return BigInt(res[0].cnt || 0);
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    joinWith(kx, rec, fromTable, propertyKey, to, aliases) {
        const kxx = kx;
        const fromColumns = to.options.name;
        const toFields = to.repository.fields;
        const toColumns = to.repository.primaryColumns;
        const toTableNameAlias = `${to.repository.tableName}_${rec}`;
        const toTable = `${to.repository.tableName} AS ${toTableNameAlias}`;
        const joinTableColumns = to.repository.columns.map(col => {
            const column = to.repository.fields[col];
            if ((0, builtin_1.hasOwnProperty)(column, "name")) {
                return `${toTableNameAlias}.${column.name} as ${String(propertyKey)}${joinSeparator}${String(col)}`;
            }
            else {
                throw new Error(`Invalid Usage: Join with raw column not allowed. (${column.raw(toTableNameAlias)})`);
            }
        });
        if (aliases)
            aliases[propertyKey] = toTableNameAlias;
        if (fromColumns.length !== toColumns.length) {
            throw new Error(`Invalid Relation: Joining columns are not matched (${fromColumns.join(",")} -> ${toColumns.join(",")})`);
        }
        kxx.leftOuterJoin(toTable, function () {
            for (let i = 0; i < fromColumns.length; i++) {
                const column = toFields[toColumns[i]];
                if ("name" in column) {
                    this.on(`${fromTable}.${fromColumns[i]}`, `${toTableNameAlias}.${column.name}`);
                }
                else {
                    throw new Error(`Invalid Usage: Join with raw column not allowed. (${column.raw(fromTable)})`);
                }
            }
        });
        kxx.select(joinTableColumns);
        let idx = 0;
        to.repository.oneToOneRelationColumns.forEach(relationColumn => {
            this.joinWith(kxx, rec * 10 + idx++, toTableNameAlias, `${String(propertyKey)}${joinSeparator}${String(relationColumn)}`, to.repository.oneToOneRelations[relationColumn], aliases);
        });
        return kxx;
    }
    join(kx, selectColumns, aliases) {
        const kxx = kx;
        let idx = 0;
        this.repositoryInfo.oneToOneRelationColumns.forEach(relationColumn => {
            if (!selectColumns || selectColumns.indexOf(relationColumn) !== -1) {
                this.joinWith(kxx, ++idx, this.repositoryInfo.tableName, relationColumn, this.repositoryInfo.oneToOneRelations[relationColumn], aliases);
            }
        });
        return kxx;
    }
    where(kx, where, orWhere) {
        let kxx = kx;
        if (!where)
            return kxx;
        Object.keys(where).forEach(ke => {
            if (ke === "$AND" || ke === "$OR") {
                const that = this;
                if (Array.isArray(where === null || where === void 0 ? void 0 : where[ke])) {
                    if (ke === "$AND") {
                        where[ke].forEach((chWhere) => {
                            kxx = kx.andWhere(function () {
                                that.where(this, chWhere, false);
                            });
                        });
                    }
                    else if (ke === "$OR") {
                        where[ke].forEach((chWhere) => {
                            kxx = kx.orWhere(function () {
                                that.where(this, chWhere, true);
                            });
                        });
                    }
                }
                else {
                    if (ke === "$AND") {
                        kx.andWhere(function () {
                            that.where(this, where === null || where === void 0 ? void 0 : where[ke], false);
                        });
                    }
                    else if (ke === "$OR") {
                        kx.orWhere(function () {
                            that.where(this, where === null || where === void 0 ? void 0 : where[ke], true);
                        });
                    }
                }
            }
            else {
                const column = this.repositoryInfo.fields[ke];
                const isConditional = (v) => typeof v === "object" && (v["$AND"] || v["$OR"]);
                const isManipulatable = (v) => typeof v === "object" &&
                    (v.hasOwnProperty(">=") ||
                        v.hasOwnProperty(">") ||
                        v.hasOwnProperty("<=") ||
                        v.hasOwnProperty("<") ||
                        v.hasOwnProperty("!=") ||
                        v.hasOwnProperty("LIKE") ||
                        v.hasOwnProperty("LIKE%") ||
                        v.hasOwnProperty("%LIKE") ||
                        v.hasOwnProperty("%LIKE%") ||
                        v.hasOwnProperty("NOT_IN") ||
                        typeof v["IS_NULL"] === "boolean" ||
                        typeof v["IS_NOT_NULL"] === "boolean");
                const raw = !!(0, builtin_1.hasOwnProperty)(column, "raw");
                const k = (0, builtin_1.hasOwnProperty)(column, "name")
                    ? `${this.repositoryInfo.tableName}.${column.name}`
                    : column.raw(this.repositoryInfo.tableName);
                const v = where === null || where === void 0 ? void 0 : where[ke];
                if (Array.isArray(v)) {
                    if (!raw) {
                        kxx.whereIn(k, v);
                    }
                    else {
                        if (v.length > 0)
                            kxx.whereRaw(`${k} IN (?)`, [v]);
                        else
                            kxx.whereRaw("false");
                    }
                }
                else if (isManipulatable(v) || isConditional(v)) {
                    const that = this;
                    kxx[orWhere ? "orWhere" : "andWhere"](function () {
                        Object.keys(v).forEach(cond => {
                            if (cond === "$AND" || cond === "$OR") {
                                this[cond === "$OR" ? "orWhere" : "andWhere"](function () {
                                    v[cond].forEach((vv) => {
                                        that.where(this, { [ke]: vv }, cond === "$OR");
                                    });
                                });
                            }
                            else if (cond === "IS_NULL" || cond === "IS_NOT_NULL") {
                                if (v["IS_NULL"] === true || v["IS_NOT_NULL"] === false) {
                                    this[orWhere ? "orWhereNull" : "whereNull"](k);
                                }
                                else if (v["IS_NULL"] === false || v["IS_NOT_NULL"] === true) {
                                    this[orWhere ? "orWhereNotNull" : "whereNotNull"](k);
                                }
                            }
                            else if (cond === "LIKE" || cond === "%LIKE" || cond === "LIKE%" || cond === "%LIKE%") {
                                if (cond === "LIKE")
                                    this[orWhere ? "orWhere" : "where"](k, "LIKE", v[cond]);
                                else if (cond === "%LIKE")
                                    this[orWhere ? "orWhere" : "where"](k, "LIKE", `%${v[cond]}`);
                                else if (cond === "LIKE%")
                                    this[orWhere ? "orWhere" : "where"](k, "LIKE", `${v[cond]}%`);
                                else if (cond === "%LIKE%")
                                    this[orWhere ? "orWhere" : "where"](k, "LIKE", `%${v[cond]}%`);
                            }
                            else if (cond === "NOT_IN") {
                                this[orWhere ? "orWhereNotIn" : "whereNotIn"](k, v[cond]);
                            }
                            else if (typeof v[cond] === "function") {
                                const res = v[cond](k);
                                if (typeof res === "object") {
                                    this.whereRaw(`${k} ${cond} ${res.operand}`, res.bindings);
                                }
                                else {
                                    this.whereRaw(`${k} ${cond} ${res}`);
                                }
                            }
                            else {
                                this[orWhere ? "orWhereRaw" : "whereRaw"](`${k} ${cond} ?`, [v[cond]]);
                            }
                        });
                    });
                }
                else if (typeof v === "function") {
                    const result = v(k);
                    if (result.hasOwnProperty("query")) {
                        kxx.whereRaw(result.query, result.bindings);
                    }
                    else {
                        kxx[orWhere ? "orWhere" : "where"](this.kx.raw(result));
                    }
                }
                else {
                    if (!raw) {
                        kxx[orWhere ? "orWhere" : "where"](k, v);
                    }
                    else {
                        kxx[orWhere ? "orWhere" : "andWhere"](function () {
                            this.whereRaw(`${k} = ?`, [v]);
                        });
                    }
                }
            }
        });
        return kxx;
    }
    order(kx, orderCond, joinAliases) {
        const order = typeof orderCond === "function" ? [orderCond] : orderCond;
        let kxx = kx;
        Object.keys(order).forEach(ke => {
            const column = this.repositoryInfo.fields[ke];
            const oto = !column && this.repositoryInfo.oneToOneRelations[ke];
            const v = order[ke];
            if (oto) {
                throw new Error("Invalid Usage: Sorting by joining column must be used delegated function.)");
            }
            else if (!column && typeof v === "function") {
                kxx = kx.orderByRaw(v(joinAliases));
            }
            else if ((0, builtin_1.hasOwnProperty)(column, "name")) {
                const k = `${this.repositoryInfo.tableName}.${column.name}`;
                if (typeof v === "function") {
                    kxx = kx.orderByRaw(v(k));
                }
                else {
                    kxx = kx.orderBy(k, v);
                }
            }
            else {
                const k = column.raw(this.repositoryInfo.tableName);
                kxx = kx.orderByRaw(`${k} ${v}`);
            }
        });
        return kxx;
    }
    mapping(row, repositoryInfo, prefix) {
        const x = (0, class_transformer_1.plainToClass)((repositoryInfo || this.repositoryInfo).target, Object.keys(row)
            .filter(e => !prefix || e.startsWith(`${prefix}${joinSeparator}`))
            .reduce((output, c) => {
            const col = !prefix ? c : c.substring(prefix.length + 1);
            if (!col.includes(joinSeparator)) {
                output[col] = row[c];
            }
            else {
                const [join] = col.split(joinSeparator);
                if (!output[join]) {
                    output[join] = this.mapping(row, (repositoryInfo || this.repositoryInfo).oneToOneRelations[join].repository, !prefix ? join : `${prefix}_${join}`);
                }
            }
            return output;
        }, {}));
        return x;
    }
}
exports.Repository = Repository;
//# sourceMappingURL=Model.entity.repository.js.map