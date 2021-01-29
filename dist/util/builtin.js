"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConstructorName = exports.hasOwnProperty = void 0;
function hasOwnProperty(obj, prop) {
    if (!obj)
        return false;
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
exports.hasOwnProperty = hasOwnProperty;
function getConstructorName(obj) {
    if (obj && obj.constructor) {
        if (hasOwnProperty(obj.constructor, "name")) {
            return obj.constructor.name;
        }
    }
    if (hasOwnProperty(obj, "name")) {
        return obj.name;
    }
    return null;
}
exports.getConstructorName = getConstructorName;
//# sourceMappingURL=builtin.js.map