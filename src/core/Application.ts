/* eslint-disable @typescript-eslint/unbound-method */
import "reflect-metadata";
import "source-map-support";

import * as bodyParser from "body-parser";
import { CorsOptions, CorsOptionsDelegate } from "cors";
import swaggerUi from "swagger-ui-express";
import { Metadata } from "./Decorator";
import { Handler } from "./Handler";
import { Injector } from "./Injector";
import { Logger } from "./Logger";
import { Server } from "./Server";
import { Controller as HttpController } from "../http/Http.controller";
import { MIDDLEWARE_PRIORITY_ACTION_HANDLER, MIDDLEWARE_PRIORITY_AFTER_HANDLER, MIDDLEWARE_PRIORITY_BEFORE_HANDLER } from "../router";
import { SwaggerGenerator, SwaggerOptions } from "../swagger";
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
  Production = "production",
  Develop = "develop",
  Demo = "demo",
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

export class Cyan {
  public readonly settings: CyanSettings;
  public readonly logger: Logger;
  public readonly server: Server;
  public readonly swaggerGenerator: SwaggerGenerator | undefined;

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

    this.logger = (settings?.logger || Logger).getInstance();
    this.logger.appName = this.settings.name || "App";

    this.server = settings?.server ? new settings.server(this) : new Server(this);

    if (this.settings.swagger && this.settings.stage && this.settings.swagger.targetEnvs.includes(this.settings.stage)) {
      this.swaggerGenerator = new SwaggerGenerator(this.settings.swagger);
    }
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
    if (this.swaggerGenerator) {
      this.initSwagger();
    }
    // Task
    this.server.afterInitRoutes();
    this.server.use(this.server.onPageNotFound);
    this.server.use(this.server.onError);

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
      this.server.use(Handler.accessLogger(this.settings.name || "App"));
    }

    if (this.settings.options?.cors) {
      this.logger.info("[handler] CorsHandler registered");
      this.server.use(Handler.corsHandler(typeof this.settings.options?.cors === "boolean" ? undefined : this.settings.options?.cors));
    }

    if (this.settings.options?.jsonBodyParser || this.settings.options?.bodyParser) {
      this.logger.info("[handler] JsonBodyParser registered");
      this.server.use(
        Handler.jsonBodyParser(
          typeof this.settings.options?.jsonBodyParser === "boolean" ? undefined : this.settings.options?.jsonBodyParser
        )
      );
    }

    if (this.settings.options?.urlEncodedBodyParser || this.settings.options?.bodyParser) {
      this.logger.info("[handler] UrlEncodedBodyParser registered");
      this.server.use(
        Handler.urlEncodedBodyParser(
          typeof this.settings.options?.urlEncodedBodyParser === "boolean" ? undefined : this.settings.options?.urlEncodedBodyParser
        )
      );
    }
  }

  private initRoutes(): void {
    this.settings.routes.map(router => {
      const controller = Injector.resolve(router);

      Metadata.getStorage()
        .routes.filter(route => route.target === router)
        .map(route => this.initHandler(controller, route));
    });
  }

  private initHandler(controller: HttpController, route: RouteMetadataArgs) {
    const basePath = this.settings.basePath?.endsWith("/") ? this.settings.basePath.slice(0, -1) : this.settings.basePath || "";
    const path = (basePath => (route.path.startsWith("/") ? `${basePath}${route.path}` : `${basePath}/${route.path}`))(basePath);

    this.logger.info(`[router] ${route.action} ${path} - ${route.target.name}.${String(route.method)}`);

    // Default middlewares
    const handlers: Array<[number, HandlerFunction]> = [
      [MIDDLEWARE_PRIORITY_BEFORE_HANDLER, Handler.beforeHandler(controller)],
      [MIDDLEWARE_PRIORITY_ACTION_HANDLER, Handler.actionHandler(controller, route)],
      [MIDDLEWARE_PRIORITY_AFTER_HANDLER, Handler.afterHandler(controller)],
    ];

    // Custom attached middlewares
    Metadata.getStorage()
      .middlewares.filter(middleware => middleware.target === route.target && middleware.method === route.method)
      .forEach(middleware => {
        handlers.push([middleware.options.priority || MIDDLEWARE_PRIORITY_ACTION_HANDLER - 100, middleware.handler]);
      });

    (this.server[route.action.toLowerCase() as keyof Server] as (...args: any[]) => any)(
      path,
      controller.beforeMiddleware(this),
      ...handlers.sort((a, b) => a[0] - b[0]).map(e => e[1]),
      controller.afterMiddleware(this),
      controller.render(this),
      Handler.errorHandler(controller, this),
      Handler.httpErrorHandler(controller)
    );
  }

  private initTasks(): void {
    if (!this.settings.tasks) {
      this.logger.info("[task] No task registered");
      return;
    }

    Metadata.getStorage()
      .tasks.filter(task => this.settings.tasks!.includes(task.target))
      .forEach(task => {
        this.initTask(task);
      });
  }

  private initTask(meta: TaskMetadataArgs) {
    const readableType = `${meta.type.slice(0, 1)}${meta.type.slice(1).toLowerCase()}`;
    const taskOptions = (() => {
      if (meta.type === TaskType.Repeat) return `(${meta.options.nextInvokeDelay})`;
      return "";
    })();

    this.logger.info(`[task] ${readableType}${taskOptions} - ${meta.target.name}.${String(meta.method)}`);

    const task = Injector.resolve(meta.target);
    const invoker = new TaskInvoker(task, meta.method, meta.options, this.logger);

    invoker.init();
  }

  public initSwagger(): void {
    if (this.swaggerGenerator) {
      const swaggerDocument = this.swaggerGenerator.generateSwaggerDocs();

      // Validate swaggerDocument
      if (!swaggerDocument || typeof swaggerDocument !== "object") {
        this.logger.error("[swagger] Invalid Swagger document generated");
        return;
      }

      const swaggerPath = this.settings.swagger?.uri || "/api-docs";

      try {
        this.server.use(swaggerPath, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        this.logger.info(`[swagger] Swagger UI available at ${swaggerPath}`);
      } catch (error) {
        this.logger.error(`[swagger] Error setting up Swagger UI: ${(error as Error)?.message}`);
      }
    } else {
      this.logger.info("[swagger] Swagger documentation is disabled");
    }
  }
}
