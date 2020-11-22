import "reflect-metadata";
import "source-map-support";
import * as bodyParser from "body-parser";
import { CorsOptions, CorsOptionsDelegate } from "cors";
import { Logger } from "./Logger";
import { Server } from "./Server";
import { ClassType } from "../types";
import { Controller as ControllerType } from "../types/Http";
export declare enum Stage {
    Local = "local",
    Development = "development",
    Staging = "staging",
    Production = "production"
}
export interface CyanSettings {
    stage?: Stage;
    name?: string;
    port?: number;
    basePath?: string;
    logger?: typeof Logger;
    server?: typeof Server;
    routes: Array<ControllerType>;
    tasks?: Array<ClassType<any>>;
    options?: {
        accessLog?: boolean;
        cors?: boolean | CorsOptions | CorsOptionsDelegate;
        bodyParser?: boolean;
        jsonBodyParser?: boolean | bodyParser.OptionsJson;
        urlEncodedBodyParser?: boolean | bodyParser.OptionsUrlencoded;
    };
}
export declare class Cyan {
    readonly settings: CyanSettings;
    readonly logger: Logger;
    readonly server: Server;
    constructor(settings?: CyanSettings);
    start(): void;
    initialize(): Server;
    listen(): void;
    private initSysHandlers;
    private initRoutes;
    private initHandler;
    private initTasks;
    private initTask;
}
