"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = exports.ModelConnectivitySettingsDriver = void 0;
const Model_connection_1 = require("./Model.connection");
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
            timezone: process.env.CYAN_DB_TIMEZONE || "+00:00",
            poolMin: process.env.CYAN_DB_POOL_MIN || 0,
            poolMax: process.env.CYAN_DB_POOL_MAX || 10,
        }, settings);
    }
    transactionWith(delegate) {
        const manager = Model_connection_1.ConnectionManager.getConnectionManager(this.settings);
        return manager.transaction(async (scope) => {
            const resp = await delegate(scope);
            return resp;
        });
    }
}
exports.Model = Model;
//# sourceMappingURL=Model.js.map