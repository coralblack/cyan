"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metadata = void 0;
class MetadataStorage {
    constructor() {
        this.routes = [];
        this.routeParams = [];
        this.middlewares = [];
        this.entities = [];
        this.entityColumns = [];
    }
}
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