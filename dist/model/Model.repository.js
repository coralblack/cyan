"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Column = exports.PrimaryColumn = exports.Repository = exports.RepositoryColumnType = void 0;
const Decorator_1 = require("../core/Decorator");
var RepositoryColumnType;
(function (RepositoryColumnType) {
    RepositoryColumnType["Primary"] = "PRIMARY";
    RepositoryColumnType["Column"] = "COLUMN";
})(RepositoryColumnType = exports.RepositoryColumnType || (exports.RepositoryColumnType = {}));
function Repository(options) {
    return function RouteInner(target) {
        Decorator_1.Metadata.getStorage().repositories.push({
            target,
            options,
        });
    };
}
exports.Repository = Repository;
function RepositoryColumn(type, options) {
    return function RouteInner(target, propertyKey) {
        Decorator_1.Metadata.getStorage().repositoryColumns.push({
            target: target.constructor,
            propertyKey,
            type,
            options: Object.assign({ name: target.name }, options),
        });
    };
}
function PrimaryColumn(options) {
    return RepositoryColumn(RepositoryColumnType.Primary, options);
}
exports.PrimaryColumn = PrimaryColumn;
function Column(options) {
    return RepositoryColumn(RepositoryColumnType.Column, options);
}
exports.Column = Column;
//# sourceMappingURL=Model.repository.js.map