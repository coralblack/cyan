"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedError = exports.TraceableError = void 0;
function TraceableError(originalError) {
    var _a;
    originalError.stack = originalError.stack + "\n" + ((_a = new Error().stack) === null || _a === void 0 ? void 0 : _a.split("\n")[2]);
    return originalError;
}
exports.TraceableError = TraceableError;
class ExtendedError extends Error {
    constructor(message, originalError) {
        super(message);
        this.originalError = originalError;
    }
}
exports.ExtendedError = ExtendedError;
//# sourceMappingURL=Error.js.map