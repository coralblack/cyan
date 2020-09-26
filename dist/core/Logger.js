"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const util_1 = require("../util");
class Logger {
    static getInstance() {
        return new Logger();
    }
    debug(...args) {
        console.debug(util_1.datetime(","), ...args);
    }
    warn(...args) {
        console.warn(util_1.datetime(","), ...args);
    }
    error(...args) {
        console.error(util_1.datetime(","), ...args);
    }
    info(...args) {
        console.info(util_1.datetime(","), ...args);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map