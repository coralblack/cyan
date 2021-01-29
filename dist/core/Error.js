"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedError = exports.TraceableError = void 0;
function TraceableError(originalError) {
    originalError.stack = originalError.stack + "\n" + new Error().stack.split("\n")[2];
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