"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cyan = exports.Stage = void 0;
require("reflect-metadata");
require("source-map-support");
const path_1 = require("path");
const Decorator_1 = require("./Decorator");
const Handler_1 = require("./Handler");
const Injector_1 = require("./Injector");
const Logger_1 = require("./Logger");
const Server_1 = require("./Server");
var Stage;
(function (Stage) {
    Stage["Local"] = "local";
    Stage["Development"] = "development";
    Stage["Staging"] = "staging";
    Stage["Production"] = "production";
})(Stage = exports.Stage || (exports.Stage = {}));
class Cyan {
    constructor(settings) {
        this.settings = Object.assign({
            stage: Stage.Local,
            name: "App",
            port: 8080,
            routes: [],
        }, settings || {});
        this.logger = (settings.logger || Logger_1.Logger).getInstance();
        this.server = settings.server ? new settings.server(this) : new Server_1.Server(this);
    }
    start() {
        this.initialize();
        this.listen();
    }
    initialize() {
        this.logger.info(`${this.settings.name}, Starting .. @ ${this.settings.stage}`);
        if (!this.settings.options || this.settings.options.bodyParser !== false) {
            this.server.use(Handler_1.Handler.jsonBodyParser());
        }
        this.server.beforeInitRoutes();
        this.initRoutes();
        this.server.afterInitRoutes();
        this.server.use(this.server.onPageNotFound);
        this.server.use(this.server.onError);
        return this.server;
    }
    listen() {
        if (this.settings.port) {
            this.server
                .listen(this.settings.port, () => this.logger.info(`${this.settings.name}, listening HTTP at ${this.settings.port}`))
                .on("error", (err) => this.logger.error(err));
        }
    }
    initRoutes() {
        this.settings.routes.map((router) => {
            const controller = Injector_1.Injector.resolve(router);
            Decorator_1.Metadata.getStorage()
                .routes.filter((route) => route.target === router)
                .map((route) => this.initHandler(controller, route));
        });
    }
    initHandler(controller, route) {
        const path = path_1.resolve(this.settings.basePath || "/", route.path);
        this.logger.info(`${this.settings.name}, [router] ${route.action} ${path} - ${route.target.name}.${route.method}`);
        this.server[route.action.toLowerCase()](path, Handler_1.Handler.beforeHandler(controller), Handler_1.Handler.actionHandler(controller, route), Handler_1.Handler.afterHandler(controller), Handler_1.Handler.errorHandler(controller), Handler_1.Handler.httpErrorHandler(controller));
    }
}
exports.Cyan = Cyan;
//# sourceMappingURL=Application.js.map