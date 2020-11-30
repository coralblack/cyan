"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneToOne = exports.EntityRelationType = void 0;
const Decorator_1 = require("../core/Decorator");
var EntityRelationType;
(function (EntityRelationType) {
    EntityRelationType["OneToOne"] = "ONE-TO-ONE";
})(EntityRelationType = exports.EntityRelationType || (exports.EntityRelationType = {}));
function EntityRelationColumn(type, options) {
    return function EntityRelationColumnInner(target, propertyKey) {
        const relationColumnEntity = Reflect.getMetadata("design:type", target, propertyKey);
        Decorator_1.Metadata.getStorage().entityRelations.push({
            target: target.constructor,
            propertyKey,
            type,
            table: relationColumnEntity,
            options: Object.assign({ name: target.name }, options),
        });
    };
}
function OneToOne(options) {
    return EntityRelationColumn(EntityRelationType.OneToOne, options);
}
exports.OneToOne = OneToOne;
//# sourceMappingURL=Model.entity.relation.js.map