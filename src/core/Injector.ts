/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
export const DECLARED_INJECT_PROPERTIES = Symbol("DECLARED_INJECT_PROPERTIES");
export const DECLARED_AUTO_INJECT_FLAG = Symbol("DECLARED_AUTO_INJECT_FLAG");

export class Injector {
  public static resolve(cls) {
    const injectProperties = Reflect.getMetadata(DECLARED_INJECT_PROPERTIES, cls);
    const autoInjectable = Reflect.getMetadata(DECLARED_AUTO_INJECT_FLAG, cls);

    if (!injectProperties && !autoInjectable) {
      return new cls();
    }

    const params = Reflect.getMetadata("design:paramtypes", cls);

    if (autoInjectable) { // Inject to all class constructor arguments
      return new cls(...params.map((e: any) => {
        return Injector.resolve(e);
      }));
    } else { // Inject to class constructor arguments only specified
      return new cls(...params.map((e: any, i: number) => {
        if (injectProperties.indexOf(i) !== -1) return Injector.resolve(e);
        else return undefined;
      }));
    }

  }
}

export function Inject() {
  return function(target: any, propertyKey: string, index?: number) {
    const type = Reflect.getMetadata("design:type", target, propertyKey);
    let instance: any;

    if (index === undefined) { // Property-based injection
      Object.defineProperty(target, propertyKey, {
        enumerable: true,
        get: function() {
          if (instance) return instance;
          instance = Injector.resolve(type);
          return instance;
        },
      });
    } else { // Argument-based injection
      const properties = Reflect.getMetadata(DECLARED_INJECT_PROPERTIES, target) || [];

      properties.push(index);
      Reflect.defineMetadata(DECLARED_INJECT_PROPERTIES, properties, target);
    }
  };
}