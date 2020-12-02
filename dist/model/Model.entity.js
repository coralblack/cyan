"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Column = exports.PrimaryColumn = exports.Entity = exports.EntityColumnType = void 0;
const Decorator_1 = require("../core/Decorator");
var EntityColumnType;
(function (EntityColumnType) {
    EntityColumnType["Primary"] = "PRIMARY";
    EntityColumnType["Column"] = "COLUMN";
})(EntityColumnType = exports.EntityColumnType || (exports.EntityColumnType = {}));
function Entity(options) {
    return function EntityInner(target) {
        Decorator_1.Metadata.getStorage().entities.push({
            target,
            options,
        });
    };
}
exports.Entity = Entity;
function EntityColumn(type, options) {
    return function EntityColumnInner(target, propertyKey) {
        Decorator_1.Metadata.getStorage().entityColumns.push({
            target: target.constructor,
            propertyKey,
            type,
            options,
        });
    };
}
function PrimaryColumn(options) {
    return EntityColumn(EntityColumnType.Primary, options);
}
exports.PrimaryColumn = PrimaryColumn;
function Column(options) {
    return EntityColumn(EntityColumnType.Column, options);
}
exports.Column = Column;
//# sourceMappingURL=Model.entity.js.map