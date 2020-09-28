/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import express, { Application as Express, Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import { Cyan } from "./Application";
import { HttpError } from "../http/Http.error";
import { HttpResponse } from "../http/Http.response";

export class Server {
  private _server: Express;

  constructor(protected readonly cyan: Cyan) {
    this._server = express();
  }

  public getServer(): Express {
    return this._server;
  }

  public beforeInitRoutes() {}
  public afterInitRoutes() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-unused-vars
  public onPageNotFound(request: ExpressRequest, response: ExpressResponse, next: NextFunction) {
    response.status(404).send(`Page Not Found. (${request.method} ${request.path})`).end();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-unused-vars
  public onError(error: Error, request: ExpressRequest, response: ExpressResponse, next: NextFunction) {
    if (error instanceof HttpError) {
      response.status(error.status).send(error.content || error.default).set(error.headers).end();
    } else if (error instanceof HttpResponse) {
      response.status(error.status).send(error.content).set(error.headers).end();
    } else {
      response.status(500).send("An error has occurred.").end();
    }
  }

  public listen(...args: any[]): any {
    return this._server.listen.call(this._server, ...args);
  }

  public get(...args: any[]): any {
    return this._server.get.call(this._server, ...args);
  }

  public post(...args: any[]): any {
    return this._server.post.call(this._server, ...args);
  }

  public put(...args: any[]): any {
    return this._server.put.call(this._server, ...args);
  }

  public patch(...args: any[]): any {
    return this._server.patch.call(this._server, ...args);
  }

  public delete(...args: any[]): any {
    return this._server.delete.call(this._server, ...args);
  }

  public use(...args: any[]): any {
    return this._server.use.call(this._server, ...args);
  }

  public enable(setting: string): any {
    return this._server.enable(setting);
  }

  public enabled(setting: string): boolean {
    return this._server.enabled(setting);
  }

  public disable(setting: string): any {
    return this._server.disable(setting);
  }

  public disabled(setting: string): boolean {
    return this._server.disabled(setting);
  }

  public set(setting: string, val: any): any {
    return this._server.set(setting, val);
  }

  public engine(ext: string, fn: (path: string, options: object, callback: (e: any, rendered: string) => void) => void): any {
    return this._server.engine(ext, fn);
  }
}
