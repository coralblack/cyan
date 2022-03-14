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
    static setInstance(logger) {
        Logger._instance = logger;
    }
    log(...args) {
        console.log((0, util_1.datetime)(","), `${this.appName} [LOG]`, ...args);
    }
    debug(...args) {
        console.debug((0, util_1.datetime)(","), `${this.appName} [DEBUG]`, ...args);
    }
    warn(...args) {
        console.warn((0, util_1.datetime)(","), `${this.appName} [WARN]`, ...args);
    }
    error(...args) {
        console.error((0, util_1.datetime)(","), `${this.appName} [ERROR]`, ...args);
    }
    info(...args) {
        console.info((0, util_1.datetime)(","), `${this.appName} [INFO]`, ...args);
    }
}
exports.Logger = Logger;
Logger._instance = null;
//# sourceMappingURL=Logger.js.map