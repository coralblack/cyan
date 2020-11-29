"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneToOne = exports.RelationEntityColumnType = void 0;
const Decorator_1 = require("../core/Decorator");
var RelationEntityColumnType;
(function (RelationEntityColumnType) {
    RelationEntityColumnType["OneToOne"] = "ONE-TO-ONE";
})(RelationEntityColumnType = exports.RelationEntityColumnType || (exports.RelationEntityColumnType = {}));
function RelationEntityColumn(type, options) {
    return function RouteInner(target, propertyKey) {
        const relationColumnEntity = Reflect.getMetadata("design:type", target, propertyKey);
        Decorator_1.Metadata.getStorage().relationEntityColumns.push({
            target: target.constructor,
            propertyKey,
            type,
            table: relationColumnEntity,
            options: Object.assign({ name: target.name }, options),
        });
    };
}
function OneToOne(options) {
    return RelationEntityColumn(RelationEntityColumnType.OneToOne, options);
}
exports.OneToOne = OneToOne;
//# sourceMappingURL=Model.relation.entity.js.map