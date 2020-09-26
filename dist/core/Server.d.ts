import { Application as Express, Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import { Cyan } from "./Application";
export declare class Server {
    protected readonly cyan: Cyan;
    private _server;
    constructor(cyan: Cyan);
    getServer(): Express;
    beforeInitRoutes(): void;
    afterInitRoutes(): void;
    onPageNotFound(request: ExpressRequest, response: ExpressResponse, next: NextFunction): void;
    onError(error: Error, request: ExpressRequest, response: ExpressResponse, next: NextFunction): void;
    listen(...args: any[]): any;
    get(...args: any[]): any;
    post(...args: any[]): any;
    put(...args: any[]): any;
    patch(...args: any[]): any;
    delete(...args: any[]): any;
    use(...args: any[]): any;
    enable(setting: string): any;
    enabled(setting: string): boolean;
    disable(setting: string): any;
    disabled(setting: string): boolean;
    set(setting: string, val: any): any;
    engine(ext: string, fn: (path: string, options: object, callback: (e: any, rendered: string) => void) => void): any;
}
