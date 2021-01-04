"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceableError = void 0;
function TraceableError(originalError) {
    originalError.stack = originalError.stack + "\n" + new Error().stack.split("\n")[2];
    return originalError;
}
exports.TraceableError = TraceableError;
//# sourceMappingURL=Error.js.map