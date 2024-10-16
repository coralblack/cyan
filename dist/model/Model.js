"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = exports.ModelConnectivitySettingsDriver = void 0;
const Model_connection_1 = require("./Model.connection");
const Error_1 = require("../core/Error");
var ModelConnectivitySettingsDriver;
(function (ModelConnectivitySettingsDriver) {
    ModelConnectivitySettingsDriver["MySQL"] = "mysql2";
})(ModelConnectivitySettingsDriver = exports.ModelConnectivitySettingsDriver || (exports.ModelConnectivitySettingsDriver = {}));
class Model {
    constructor(settings) {
        this.settings = Object.assign({
            driver: process.env.CYAN_DB_DRIVER || ModelConnectivitySettingsDriver.MySQL,
            host: process.env.CYAN_DB_HOST || null,
            port: process.env.CYAN_DB_PORT || 3306,
            username: process.env.CYAN_DB_USERNAME || null,
            password: process.env.CYAN_DB_PASSWORD || null,
            database: process.env.CYAN_DB_DATABASE || null,
            charset: process.env.CYAN_DB_CHARSET || "utf8",
            timezone: process.env.CYAN_DB_TIMEZONE || null,
            poolMin: process.env.CYAN_DB_POOL_MIN || 0,
            poolMax: process.env.CYAN_DB_POOL_MAX || 10,
            connectTimeout: process.env.CYAN_DB_CONNECT_TIMEOUT || 60 * 1000,
            createConnectionTimeout: process.env.CYAN_DB_CREATE_CONNECTION_TIMEOUT || 30 * 1000,
            acquireConnectionTimeout: process.env.CYAN_DB_ACQUIRE_CONNECTION_TIMEOUT || 60 * 1000,
        }, settings);
        this._connection = Model_connection_1.ConnectionManager.getConnectionManager(this.settings);
    }
    async transactionWith(delegate, scope) {
        if (scope) {
            try {
                const resp = await delegate(scope);
                return resp;
            }
            catch (err) {
                throw (0, Error_1.TraceableError)(err);
            }
        }
        return this._connection.transaction(async (scope) => {
            const resp = await delegate(scope);
            return resp;
        });
    }
    get connection() {
        return this._connection;
    }
}
exports.Model = Model;
//# sourceMappingURL=Model.js.map