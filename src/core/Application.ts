/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import "reflect-metadata";
import "source-map-support";

import { resolve } from "path";
import * as bodyParser from "body-parser";
import { CorsOptions, CorsOptionsDelegate } from "cors";
import { Metadata } from "./Decorator";
import { Handler } from "./Handler";
import { Injector } from "./Injector";
import { Logger } from "./Logger";
import { Server } from "./Server";
import { Controller as HttpController } from "../http/Http.controller";
import { MIDDLEWARE_PRIORITY_ACTION_HANDLER, MIDDLEWARE_PRIORITY_AFTER_HANDLER, MIDDLEWARE_PRIORITY_BEFORE_HANDLER } from "../router";
import { TaskInvoker } from "../task/Task.invoker";
import { TaskType } from "../task/Task.types";
import { ClassType } from "../types";
import { HandlerFunction } from "../types/Handler";
import { Controller as ControllerType } from "../types/Http";
import { RouteMetadataArgs, TaskMetadataArgs } from "../types/MetadataArgs";

export enum Stage {
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

export class Cyan {
  public readonly settings: CyanSettings;
  public readonly logger: Logger;
  public readonly server: Server;

  constructor(settings?: CyanSettings) {
    this.settings = Object.assign(
      {
        stage: Stage.Local,
        name: "App",
        port: 8080,
        routes: [],
      },
      settings || {}
    );

    this.logger = (settings.logger || Logger).getInstance();
    this.logger.appName = this.settings.name;

    this.server = settings.server ? new settings.server(this) : new Server(this);
  }

  public start(): void {
    this.initialize();
    this.listen();
  }

  public initialize(): Server {
    this.logger.info(`Starting Server @ ${this.settings.stage}`);

    // HTTP Server
    this.server.beforeInitSys();
    this.initSysHandlers();
    this.server.afterInitSys();

    this.server.beforeInitRoutes();
    this.initRoutes();
    this.server.afterInitRoutes();

    this.server.use(this.server.onPageNotFound);
    this.server.use(this.server.onError);

    // Task
    this.initTasks();

    return this.server;
  }

  public listen(): void {
    if (this.settings.port) {
      this.server
        .listen(this.settings.port, () => this.logger.info(`listening HTTP at ${this.settings.port}`))
        .on("error", (err: Error) => this.logger.error(err));
    }
  }

  private initSysHandlers(): void {
    if (this.settings.options?.accessLog) {
      this.logger.info("[handler] AccessLogger registered");
      this.server.use(Handler.accessLogger(this.settings.name));
    }

    if (this.settings.options?.cors) {
      this.logger.info("[handler] CorsHandler registered");
      this.server.use(Handler.corsHandler(
        typeof this.settings.options?.cors === "boolean" ?
          undefined :
          this.settings.options?.cors)
      );
    }

    if (this.settings.options?.jsonBodyParser || this.settings.options?.bodyParser) {
      this.logger.info("[handler] JsonBodyParser registered");
      this.server.use(Handler.jsonBodyParser(
        typeof this.settings.options?.jsonBodyParser === "boolean" ?
          undefined :
          this.settings.options?.jsonBodyParser)
      );
    }

    if (this.settings.options?.urlEncodedBodyParser || this.settings.options?.bodyParser) {
      this.logger.info("[handler] UrlEncodedBodyParser registered");
      this.server.use(Handler.urlEncodedBodyParser(
        typeof this.settings.options?.urlEncodedBodyParser === "boolean" ?
          undefined :
          this.settings.options?.urlEncodedBodyParser)
      );
    }
  }

  private initRoutes(): void {
    this.settings.routes.map((router) => {
      const controller = Injector.resolve(router);

      Metadata.getStorage()
        .routes.filter((route) => route.target === router)
        .map((route) => this.initHandler(controller, route));
    });
  }

  private initHandler(controller: HttpController, route: RouteMetadataArgs) {
    const path = resolve(this.settings.basePath || "/", route.path);

    this.logger.info(`[router] ${route.action} ${path} - ${route.target.name}.${route.method}`);

    // Default middlewares
    const handlers: Array<[number, HandlerFunction]> = [
      [MIDDLEWARE_PRIORITY_BEFORE_HANDLER, Handler.beforeHandler(controller)],
      [MIDDLEWARE_PRIORITY_ACTION_HANDLER, Handler.actionHandler(controller, route)],
      [MIDDLEWARE_PRIORITY_AFTER_HANDLER, Handler.afterHandler(controller)],
    ];

    // Custom attached middlewares
    Metadata.getStorage().middlewares
      .filter(middleware => middleware.target === route.target && middleware.method === route.method)
      .forEach(middleware => {
        handlers.push([middleware.options.priority || (MIDDLEWARE_PRIORITY_ACTION_HANDLER - 100), middleware.handler]);
      });

    this.server[route.action.toLowerCase()](
      path,
      controller.beforeMiddleware(this),
      ...handlers.sort((a, b) => a[0] - b[0]).map(e => e[1]),
      controller.afterMiddleware(this),
      controller.render(this),
      Handler.errorHandler(controller),
      Handler.httpErrorHandler(controller)
    );
  }

  private initTasks(): void {
    if (!this.settings.tasks) {
      this.logger.info("[task] No task registered");
      return;
    }
    
    Metadata.getStorage().tasks.filter(task => this.settings.tasks.includes(task.target)).forEach(task => {
      this.initTask(task);
    });
  }

  private initTask(meta: TaskMetadataArgs) {
    const readableType = `${meta.type.slice(0, 1)}${meta.type.slice(1).toLowerCase()}`;
    const taskOptions = (() => {
      if (meta.type === TaskType.Repeat) return `(${meta.options.nextInvokeDelay})`;
      return "";
    })();
   
    this.logger.info(`[task] ${readableType}${taskOptions} - ${meta.target.name}.${meta.method}`);

    const task = Injector.resolve(meta.target);
    const invoker = new TaskInvoker(task, meta.method, meta.options, this.logger);

    invoker.init();
  }
}
