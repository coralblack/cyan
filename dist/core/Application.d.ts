import "reflect-metadata";
import "source-map-support";
import { CorsOptions, CorsOptionsDelegate } from "cors";
import { Logger } from "./Logger";
import { Server } from "./Server";
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
    options?: {
        cors?: boolean | CorsOptions | CorsOptionsDelegate;
        bodyParser?: boolean;
    };
}
export declare class Cyan {
    settings: CyanSettings;
    logger: Logger;
    server: Server;
    constructor(settings?: CyanSettings);
    start(): void;
    private initialize;
    private initRoutes;
    private initHandler;
}
