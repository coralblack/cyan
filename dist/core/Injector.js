"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inject = exports.Injector = exports.DECLARED_AUTO_INJECT_FLAG = exports.DECLARED_INJECT_PROPERTIES = void 0;
exports.DECLARED_INJECT_PROPERTIES = Symbol("DECLARED_INJECT_PROPERTIES");
exports.DECLARED_AUTO_INJECT_FLAG = Symbol("DECLARED_AUTO_INJECT_FLAG");
class Injector {
    static resolve(cls) {
        const injectProperties = Reflect.getMetadata(exports.DECLARED_INJECT_PROPERTIES, cls);
        const autoInjectable = Reflect.getMetadata(exports.DECLARED_AUTO_INJECT_FLAG, cls);
        if (!injectProperties && !autoInjectable) {
            return new cls();
        }
        const params = Reflect.getMetadata("design:paramtypes", cls);
        if (autoInjectable) {
            return new cls(...params.map((e) => {
                return Injector.resolve(e);
            }));
        }
        else {
            return new cls(...params.map((e, i) => {
                if (injectProperties.indexOf(i) !== -1)
                    return Injector.resolve(e);
                else
                    return undefined;
            }));
        }
    }
}
exports.Injector = Injector;
function Inject() {
    return function (target, propertyKey, index) {
        const type = Reflect.getMetadata("design:type", target, propertyKey);
        let instance;
        if (index === undefined) {
            Object.defineProperty(target, propertyKey, {
                enumerable: true,
                get: function () {
                    if (instance)
                        return instance;
                    instance = Injector.resolve(type);
                    return instance;
                },
            });
        }
        else {
            const properties = Reflect.getMetadata(exports.DECLARED_INJECT_PROPERTIES, target) || [];
            properties.push(index);
            Reflect.defineMetadata(exports.DECLARED_INJECT_PROPERTIES, properties, target);
        }
    };
}
exports.Inject = Inject;
//# sourceMappingURL=Injector.js.map