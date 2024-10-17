"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metadata = exports.MetadataStorage = void 0;
class MetadataStorage {
    constructor() {
        this.routes = [];
        this.routeParams = [];
        this.middlewares = [];
        this.entities = [];
        this.entityColumns = [];
        this.entityRelations = [];
        this.tasks = [];
        this.swaggerOperations = [];
        this.swaggerProperties = [];
        this.swaggerModels = [];
        this.swaggerResponses = [];
        this.swaggerControllerTags = [];
    }
}
exports.MetadataStorage = MetadataStorage;
class Metadata {
    static getStorage() {
        if (global.decoratorMetadataStorage) {
            return global.decoratorMetadataStorage;
        }
        const metadataStorage = new MetadataStorage();
        global.decoratorMetadataStorage = metadataStorage;
        return metadataStorage;
    }
}
exports.Metadata = Metadata;
//# sourceMappingURL=Decorator.js.map