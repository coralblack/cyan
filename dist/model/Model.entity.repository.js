"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = exports.symRepositoryInfo = void 0;
const class_transformer_1 = require("class-transformer");
const Model_entity_1 = require("./Model.entity");
const Model_entity_relation_1 = require("./Model.entity.relation");
const Decorator_1 = require("../core/Decorator");
const Error_1 = require("../core/Error");
const builtin_1 = require("../util/builtin");
const joinSeparator = "_";
exports.symRepositoryInfo = Symbol();
class Repository {
    constructor(scope, entity) {
        this.scope = scope;
        this.repositoryInfo = Repository.getRepositoryInfo(entity);
    }
    static getRepositoryInfo(entity) {
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
            (info.tableName = metadata.options.name),
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
                .reduce((p, e) => {
                p[e.propertyKey] = {
                    options: Object.assign(Object.assign({}, e.options), { name: Array.isArray(e.options.name) ? e.options.name : [e.options.name] }),
                    repository: Repository.getRepositoryInfo(e.options.target),
                };
                return p;
            }, {}));
        return info;
    }
    async save(entity) {
        try {
            const [res] = await this.scope.kx
                .insert(this.repositoryInfo.columns.reduce((p, e) => {
                const [key, val] = (() => {
                    const column = this.repositoryInfo.fields[e];
                    if ((0, builtin_1.hasOwnProperty)(column, "name")) {
                        const key = column.name;
                        const val = ((v) => {
                            if (typeof v === "function")
                                return this.scope.kx.raw(v(key));
                            else if (v === undefined && column.default) {
                                return this.scope.kx.raw(column.default(key));
                            }
                            else
                                return v;
                        })(entity[e]);
                        return [key, val];
                    }
                    else {
                        if ((0, builtin_1.hasOwnProperty)(entity, e)) {
                            throw new Error(`Invalid Usage: Save with raw column not allowed. (${column.raw(this.repositoryInfo.tableName)})`);
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
            }, {}))
                .into(this.repositoryInfo.tableName);
            if (this.repositoryInfo.primaryColumns.length === 1) {
                const id = entity[this.repositoryInfo.primaryColumns[0]];
                if (id && typeof id !== "function") {
                    return entity[this.repositoryInfo.primaryColumns[0]];
                }
            }
            const [[lid]] = await this.scope.kx.raw("SELECT LAST_INSERT_ID() AS seq");
            return res || lid.seq;
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async saveBulk(entities) {
        try {
            if (this.repositoryInfo.primaryColumns.length !== 1) {
                throw new Error("Not Supprted: SaveBulk with multiple primary columns. ");
            }
            else if (entities.find(e => !e[this.repositoryInfo.primaryColumns[0]])) {
                throw new Error("Not Supprted: SaveBulk with empty primary column value. ");
            }
            const insertedIds = [];
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
                        }
                        else if ("name" in field) {
                            const key = field.name;
                            const val = ((v) => {
                                if (typeof v === "function")
                                    return this.scope.kx.raw(v(key));
                                else if (v === undefined && field.default) {
                                    return this.scope.kx.raw(field.default(key));
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
                    if (isPrimaryColumn) {
                        insertedIds.push(val);
                    }
                    p[key] = val;
                    return p;
                }, {});
            });
            await this.scope.kx.insert(newEntities).into(this.repositoryInfo.tableName);
            return insertedIds;
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async update(entity, options) {
        try {
            let kx = this.scope.kx.from(this.repositoryInfo.tableName);
            const conditions = Object.assign({}, (options === null || options === void 0 ? void 0 : options.where) || {});
            this.repositoryInfo.primaryColumns.forEach(e => {
                conditions[e] = entity[e];
            });
            kx = this.where(kx, conditions);
            kx = kx.update(((options === null || options === void 0 ? void 0 : options.update) || this.repositoryInfo.columns).reduce((p, e) => {
                const column = this.repositoryInfo.fields[e];
                if ((0, builtin_1.hasOwnProperty)(column, "name")) {
                    p[column.name] = entity[e];
                }
                else {
                    throw new Error(`Invalid Usage: Update with raw column not allowed. (${column.raw(this.repositoryInfo.tableName)})`);
                }
                return p;
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
    async updateBulk(entities, options) {
        try {
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
                throw new Error(`Invalid Usage: UpdateBulk with primary column(${primaryColumn}) not allowed.`);
            }
            else if (updateFieldNames.length !== options.update.length) {
                throw new Error(`Invalid Usage: UpdateBulk with column(${options.update.join(", ")}) not allowed.`);
            }
            const entityIds = entities.map(e => e[primaryColumn]);
            const findWhere = {};
            findWhere[primaryColumn] = entityIds;
            const ids = (await this.select({ where: findWhere, forUpdate: true, select: [primaryColumn] })).map(e => e[primaryColumn]);
            const filteredEntities = entities.filter(e => ids.includes(e[primaryColumn]));
            const updatedEntities = filteredEntities.map(entity => {
                return this.repositoryInfo.columns.reduce((p, column) => {
                    const field = this.repositoryInfo.fields[column];
                    if (!field) {
                        throw new Error(`Invalid Usage: UpdateBulk with raw column(${column}) not allowed.`);
                    }
                    else if ("name" in field) {
                        if (entity[column] === undefined) {
                            throw new Error(`Invalid Usage: UpdateBulk with raw column(${column}) is undefined.`);
                        }
                        p[field.name] = entity[column];
                    }
                    else {
                        throw new Error(`Invalid Usage: UpdateBulk with raw column not allowed. (${field.raw(this.repositoryInfo.tableName)})`);
                    }
                    return p;
                }, { [primaryColumn]: entity[primaryColumn] });
            });
            await this.scope.kx.insert(updatedEntities).into(this.repositoryInfo.tableName).onConflict(primaryFieldName).merge(updateFieldNames);
            return updatedEntities.length;
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async delete(entity, options) {
        try {
            let kx = this.scope.kx.from(this.repositoryInfo.tableName);
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
    async findOne(options) {
        try {
            const [res] = await this.select(Object.assign(Object.assign({}, options), { limit: 1 }));
            return res || null;
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async find(options) {
        try {
            const res = await this.select(options);
            return res;
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async pagination(options) {
        try {
            const page = Math.max(1, options && options.page ? options.page : 1);
            const rpp = Math.max(1, options && options.rpp ? options.rpp : 30);
            const limit = BigInt(rpp);
            const offset = (BigInt(page) - BigInt(1)) * limit;
            const count = (await this.where(this.scope.kx.from(this.repositoryInfo.tableName), options.where || {}).count("* as cnt"))[0].cnt;
            const items = await this.find(Object.assign(Object.assign({}, options), { limit, offset }));
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
    streaming(options) {
        try {
            return this.prepareQuery(options).stream();
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async streamAsync(options, streamFn) {
        try {
            const kx = this.prepareQuery(options);
            kx.stream(stream => {
                stream.on("data", row => streamFn.onData(this.mapping(row)));
                if (streamFn.onStreamEnd) {
                    stream.on("end", () => streamFn.onStreamEnd());
                }
            });
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    prepareQuery(options) {
        try {
            const joinAliases = {};
            let kx = this.scope.kx.from(this.repositoryInfo.tableName);
            const selectColumns = options.select || this.repositoryInfo.columns;
            const select = selectColumns
                .filter(x => this.repositoryInfo.columns.indexOf(x) !== -1)
                .map(alias => {
                const column = this.repositoryInfo.fields[alias];
                if ((0, builtin_1.hasOwnProperty)(column, "name")) {
                    return `${this.repositoryInfo.tableName}.${column.name} as ${alias}`;
                }
                else {
                    kx.select(this.scope.kx.raw(`${column.raw(this.repositoryInfo.tableName)} as ${alias}`));
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
            kx = this.join(kx, options.select, joinAliases);
            if (options.where) {
                kx = this.where(kx, options.where);
            }
            const joinAliasesProp = Object.keys(joinAliases).reduce((p, e) => {
                p[`.${e.split(joinSeparator).join(".")}`] = joinAliases[e];
                return p;
            }, {});
            if (options.order) {
                const orderBy = Array.isArray(options.order) ? options.order : [options.order];
                for (let i = 0; i < orderBy.length; i++) {
                    kx = this.order(kx, orderBy[i], joinAliasesProp);
                }
            }
            if (options.offset)
                kx = kx.offset(String(options.offset));
            if (options.limit)
                kx = kx.limit(String(options.limit));
            if (options.debug) {
                console.log(">", kx.toSQL());
            }
            return kx;
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async select(options) {
        try {
            const rows = await this.prepareQuery(options);
            if (!rows || !rows.length)
                return [];
            return rows.map((row) => this.mapping(row));
        }
        catch (err) {
            throw (0, Error_1.TraceableError)(err);
        }
    }
    async count(options) {
        try {
            let kx = this.scope.kx.count("* AS cnt").from(this.repositoryInfo.tableName);
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
                return `${toTableNameAlias}.${column.name} as ${propertyKey}${joinSeparator}${col}`;
            }
            else {
                throw new Error(`Invalid Usage: Join with raw column not allowed. (${column.raw(toTableNameAlias)})`);
            }
        });
        aliases[propertyKey] = toTableNameAlias;
        if (fromColumns.length !== toColumns.length) {
            throw new Error(`Invalid Relation: Joining columns are not matched (${fromColumns.join(",")} -> ${toColumns.join(",")})`);
        }
        kxx.leftOuterJoin(toTable, function () {
            for (let i = 0; i < fromColumns.length; i++) {
                const column = toFields[toColumns[i]];
                if ((0, builtin_1.hasOwnProperty)(column, "name")) {
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
            this.joinWith(kxx, rec * 10 + idx++, toTableNameAlias, `${propertyKey}${joinSeparator}${relationColumn}`, to.repository.oneToOneRelations[relationColumn], aliases);
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
                    }
                    else if (ke === "$OR") {
                        where[ke].forEach(chWhere => {
                            kxx = kx.orWhere(function () {
                                that.where(this, chWhere, true);
                            });
                        });
                    }
                }
                else {
                    if (ke === "$AND") {
                        kx.andWhere(function () {
                            that.where(this, where[ke], false);
                        });
                    }
                    else if (ke === "$OR") {
                        kx.orWhere(function () {
                            that.where(this, where[ke], true);
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
                        typeof v["IS_NULL"] === "boolean" ||
                        typeof v["IS_NOT_NULL"] === "boolean");
                const raw = !!(0, builtin_1.hasOwnProperty)(column, "raw");
                const k = (0, builtin_1.hasOwnProperty)(column, "name")
                    ? `${this.repositoryInfo.tableName}.${column.name}`
                    : column.raw(this.repositoryInfo.tableName);
                const v = where[ke];
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
                    kxx[orWhere ? "orWhere" : "where"](this.scope.kx.raw(v(k)));
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
            .reduce((p, c) => {
            const col = !prefix ? c : c.substring(prefix.length + 1);
            if (!col.includes(joinSeparator)) {
                p[col] = row[c];
            }
            else {
                const [join] = col.split(joinSeparator);
                if (!p[join]) {
                    p[join] = this.mapping(row, (repositoryInfo || this.repositoryInfo).oneToOneRelations[join].repository, !prefix ? join : `${prefix}_${join}`);
                }
            }
            return p;
        }, {}));
        return x;
    }
}
exports.Repository = Repository;
//# sourceMappingURL=Model.entity.repository.js.map