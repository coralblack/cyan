import { HandlerFunction } from "../types/Handler";
export declare const MIDDLEWARE_PRIORITY_BEFORE_HANDLER = 10000;
export declare const MIDDLEWARE_PRIORITY_ACTION_HANDLER = 20000;
export declare const MIDDLEWARE_PRIORITY_AFTER_HANDLER = 30000;
export interface MiddlewareOptions {
    priority?: number;
}
export declare function Middleware(handler: HandlerFunction, options?: MiddlewareOptions): MethodDecorator;
