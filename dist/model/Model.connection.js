"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = exports.TransactionScope = void 0;
const knex_1 = __importDefault(require("knex"));
const Model_1 = require("./Model");
const Model_entity_repository_1 = require("./Model.entity.repository");
const managers = {};
class TransactionScope {
    constructor(kx) {
        this.kx = kx;
    }
    async execute(query, params, options) {
        const [res] = await this.kx.raw(query, params);
        (options === null || options === void 0 ? void 0 : options.debug) && console.log(this.kx.raw(query, params).toQuery());
        return res;
    }
    getRepository(repository) {
        return new Model_entity_repository_1.Repository(this, repository);
    }
}
exports.TransactionScope = TransactionScope;
class ConnectionManager {
    constructor(kx) {
        this.kx = kx;
    }
    static getConnectionManager(settings) {
        const key = `${settings.driver}/${settings.username}:###@${settings.host}:${settings.port}/${settings.database}`;
        if (managers[key])
            return managers[key];
        const opts = {
            client: settings.driver,
            connection: {
                host: settings.host,
                user: settings.username,
                port: settings.port,
                password: settings.password,
                database: settings.database,
                timezone: settings.timezone,
                charset: settings.charset,
                connectTimeout: settings.connectTimeout,
                supportBigNumbers: true,
                bigNumberStrings: true,
                ...((settings === null || settings === void 0 ? void 0 : settings.extra) || {}),
            },
            pool: {
                min: settings.poolMin,
                max: settings.poolMax,
                createTimeoutMillis: settings.createConnectionTimeout,
                acquireTimeoutMillis: settings.acquireConnectionTimeout,
            },
            acquireConnectionTimeout: settings.acquireConnectionTimeout,
        };
        if (settings.driver === Model_1.ModelConnectivitySettingsDriver.MySQL) {
            delete opts.connection.timezone;
            opts.options = { bindObjectAsString: true };
            if (settings.timezone) {
                opts.pool.afterCreate = function (connection, callback) {
                    connection.query(`SET time_zone = '${settings.timezone.replace(/'/g, "\\'")}';`, err => {
                        callback(err, connection);
                    });
                };
            }
            opts.connection.typeCast = function (field, next) {
                if (["NEWDECIMAL", "DECIMAL", "LONGLONG"].includes(field.type)) {
                    const val = field.string();
                    if (val === null)
                        return null;
                    if (field.type === "LONGLONG") {
                        return BigInt(val);
                    }
                    else {
                        return val;
                    }
                }
                return next();
            };
        }
        const kx = (0, knex_1.default)(opts);
        managers[key] = new ConnectionManager(kx);
        return managers[key];
    }
    transaction(ctx) {
        return this.kx.transaction((trx) => {
            const connectivity = new TransactionScope(trx);
            return ctx(connectivity);
        });
    }
    getRepository(entity) {
        return new Model_entity_repository_1.Repository(this.kx, entity);
    }
}
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=Model.connection.js.map