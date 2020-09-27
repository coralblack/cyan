"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = exports.ModelScope = void 0;
const knex_1 = __importDefault(require("knex"));
const Model_1 = require("./Model");
const Model_repository_1 = require("./Model.repository");
const managers = {};
class ModelScope {
    constructor(kx) {
        this.kx = kx;
    }
    async execute(query, params) {
        const [res] = await this.kx.raw(query, params);
        return res;
    }
    getRepository(entity) {
        return new Model_repository_1.Repository(this, entity);
    }
}
exports.ModelScope = ModelScope;
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
                password: settings.password,
                database: settings.database,
                timezone: settings.timezone,
                charset: settings.charset,
                supportBigNumbers: true,
                bigNumberStrings: true,
            },
            pool: {
                min: settings.poolMin,
                max: settings.poolMax,
            },
        };
        if (settings.driver === Model_1.ModelConnectivitySettingsDriver.MySQL) {
            delete opts.connection.timezone;
            opts.options = { bindObjectAsString: true };
            opts.pool.afterCreate = function (connection, callback) {
                connection.query(`SET time_zone = '${settings.timezone.replace(/'/g, "\\'")}';`, function (err) {
                    callback(err, connection);
                });
            };
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
        const kx = knex_1.default(opts);
        managers[key] = new ConnectionManager(kx);
        return managers[key];
    }
    transaction(ctx) {
        return this.kx.transaction((trx) => {
            const connectivity = new ModelScope(trx);
            return ctx(connectivity);
        });
    }
}
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=Model.connection.js.map