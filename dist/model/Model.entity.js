"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColumnByEntityProperty = exports.getEntityProperties = exports.Column = exports.PrimaryColumn = exports.Entity = exports.EntityColumnType = void 0;
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
            options: options || { name: "" },
        });
    };
}
exports.Entity = Entity;
function EntityColumn(type, options) {
    return function EntityColumnInner(target, propertyKey) {
        if (typeof propertyKey === "string" && propertyKey.includes("_")) {
            throw new Error(`Invalid Usage: Underscore is not allowed for the property key. (${propertyKey})`);
        }
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
function getEntityProperties(entity) {
    return Decorator_1.Metadata.getStorage()
        .entityColumns.filter(x => x.target === entity)
        .map(x => x.propertyKey)
        .concat(Decorator_1.Metadata.getStorage()
        .entityRelations.filter(x => x.target === entity)
        .map(x => x.propertyKey));
}
exports.getEntityProperties = getEntityProperties;
function getColumnByEntityProperty(entity, propertyKey) {
    return (entityColumn => ((entityColumn === null || entityColumn === void 0 ? void 0 : entityColumn.options) && "name" in (entityColumn === null || entityColumn === void 0 ? void 0 : entityColumn.options) ? entityColumn.options.name : undefined))(Decorator_1.Metadata.getStorage().entityColumns.find(x => x.target === entity && x.propertyKey === propertyKey));
}
exports.getColumnByEntityProperty = getColumnByEntityProperty;
//# sourceMappingURL=Model.entity.js.map