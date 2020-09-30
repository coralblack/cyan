"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const util_1 = require("../util");
class Logger {
    constructor() {
        this.appName = "App";
    }
    static getInstance() {
        if (Logger._instance)
            return Logger._instance;
        Logger._instance = new Logger();
        return Logger._instance;
    }
    debug(...args) {
        console.debug(util_1.datetime(","), `${this.appName},`, ...args);
    }
    warn(...args) {
        console.warn(util_1.datetime(","), `${this.appName},`, ...args);
    }
    error(...args) {
        console.error(util_1.datetime(","), `${this.appName},`, ...args);
    }
    info(...args) {
        console.info(util_1.datetime(","), `${this.appName},`, ...args);
    }
}
exports.Logger = Logger;
Logger._instance = null;
//# sourceMappingURL=Logger.js.map