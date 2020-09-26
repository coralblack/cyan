export declare const DECLARED_INJECT_PROPERTIES: unique symbol;
export declare const DECLARED_AUTO_INJECT_FLAG: unique symbol;
export declare class Injector {
    static resolve(cls: any): any;
}
export declare function Inject(): (target: any, propertyKey: string, index?: number) => void;
