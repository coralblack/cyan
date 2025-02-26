import { Metadata } from "../core/Decorator";
import { HttpMethod } from "../http/Http.method";

export interface RouteOptions {}

function Route(action: HttpMethod, path: string, options: RouteOptions): MethodDecorator {
  return function RouteInner(target: any, method: string | symbol) {
    const params = Reflect.getMetadata("design:paramtypes", target, method);

    Metadata.getStorage().routes.push({
      target: target.constructor,
      method,
      action,
      path,
      params,
      options,
    });
  };
}

export function Delete(path: string, options?: RouteOptions): MethodDecorator {
  return Route(HttpMethod.Delete, path, options || {});
}

export function Get(path: string, options?: RouteOptions): MethodDecorator {
  return Route(HttpMethod.Get, path, options || {});
}

export function Patch(path: string, options?: RouteOptions): MethodDecorator {
  return Route(HttpMethod.Patch, path, options || {});
}

export function Post(path: string, options?: RouteOptions): MethodDecorator {
  return Route(HttpMethod.Post, path, options || {});
}

export function Put(path: string, options?: RouteOptions): MethodDecorator {
  return Route(HttpMethod.Put, path, options || {});
}
