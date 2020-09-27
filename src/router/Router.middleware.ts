/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Metadata } from "../core/Decorator";
import { HandlerFunction } from "../types/Handler";

export const MIDDLEWARE_PRIORITY_BEFORE_HANDLER = 10000;
export const MIDDLEWARE_PRIORITY_ACTION_HANDLER = 20000;
export const MIDDLEWARE_PRIORITY_AFTER_HANDLER = 30000;

export interface MiddlewareOptions {
  priority?: number;
}

export function Middleware(handler: HandlerFunction, options?: MiddlewareOptions): MethodDecorator {
  return function MiddlewareInner<T>(target: Object, method: string, descriptor: TypedPropertyDescriptor<T>) {
    Metadata.getStorage().middlewares.push({
      target: target.constructor,
      method,
      handler,
      options: Object.assign({ priority: 15000 }, options),
    });
  };
}