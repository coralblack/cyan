/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import "reflect-metadata";
import "source-map-support";

import { resolve } from "path";
import { CorsOptions, CorsOptionsDelegate } from "cors";
import { Metadata } from "./Decorator";
import { Handler } from "./Handler";
import { Injector } from "./Injector";
import { Logger } from "./Logger";
import { Server } from "./Server";
import { Controller as HttpController } from "../http/Http.controller";
import { Controller as ControllerType } from "../types/Http";
import { RouteMetadataArgs } from "../types/MetadataArgs";

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

  options?: {
    cors?: boolean | CorsOptions | CorsOptionsDelegate;
    bodyParser?: boolean;
  };
}

export class Cyan {
  settings: CyanSettings;
  logger: Logger;
  server: Server;

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
    this.server = settings.server ? new settings.server(this) : new Server(this);
  }

  public start(): void {
    this.initialize();
  }

  private initialize(): void {
    this.logger.info(`${this.settings.name}, Starting .. @ ${this.settings.stage}`);

    if (!this.settings.options || this.settings.options.bodyParser !== false) {
      this.server.use(Handler.jsonBodyParser());
    }

    this.server.beforeInitRoutes();
    this.initRoutes();
    this.server.afterInitRoutes();

    this.server.use(this.server.onPageNotFound);
    this.server.use(this.server.onError);

    this.server
      .listen(this.settings.port, () => this.logger.info(`${this.settings.name}, listening HTTP at ${this.settings.port}`))
      .on("error", (err: Error) => this.logger.error(err));
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

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    this.logger.info(`${this.settings.name}, [router] ${route.action} ${path} - ${route.target.name}.${route.method}`);

    this.server[route.action.toLowerCase()](
      path,
      Handler.beforeHandler(controller),
      Handler.actionHandler(controller, route),
      Handler.afterHandler(controller),
      Handler.errorHandler(controller),
      Handler.httpErrorHandler(controller)
    );
  }
}
