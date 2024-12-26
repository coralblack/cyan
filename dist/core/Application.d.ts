import "reflect-metadata";
import "source-map-support";
import * as bodyParser from "body-parser";
import { CorsOptions, CorsOptionsDelegate } from "cors";
import { Logger } from "./Logger";
import { Server } from "./Server";
import { SwaggerGenerator, SwaggerOptions } from "../swagger";
import { ClassType } from "../types";
import { Controller as ControllerType } from "../types/Http";
export declare enum Stage {
    Local = "local",
    Development = "development",
    Staging = "staging",
    Production = "production",
    Develop = "develop",
    Demo = "demo"
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
    swagger?: SwaggerOptions;
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
    readonly swaggerGenerator: SwaggerGenerator;
    constructor(settings?: CyanSettings);
    start(): void;
    initialize(): Server;
    listen(): void;
    private initSysHandlers;
    private initRoutes;
    private initHandler;
    private initTasks;
    private initTask;
    initSwagger(): void;
}
