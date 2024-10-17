"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cyan = exports.Stage = void 0;
require("reflect-metadata");
require("source-map-support");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const Decorator_1 = require("./Decorator");
const Handler_1 = require("./Handler");
const Injector_1 = require("./Injector");
const Logger_1 = require("./Logger");
const Server_1 = require("./Server");
const SwaggerGenerator_1 = require("./SwaggerGenerator");
const router_1 = require("../router");
const Task_invoker_1 = require("../task/Task.invoker");
const Task_types_1 = require("../task/Task.types");
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
        this.logger.appName = this.settings.name;
        this.server = settings.server ? new settings.server(this) : new Server_1.Server(this);
        if ([Stage.Local, Stage.Development].includes(this.settings.stage) && this.settings.swagger) {
            this.swaggerGenerator = new SwaggerGenerator_1.SwaggerGenerator(this.settings.swagger);
        }
    }
    start() {
        this.initialize();
        this.listen();
    }
    initialize() {
        this.logger.info(`Starting Server @ ${this.settings.stage}`);
        this.server.beforeInitSys();
        this.initSysHandlers();
        this.server.afterInitSys();
        this.server.beforeInitRoutes();
        this.initRoutes();
        if (this.swaggerGenerator) {
            this.initSwagger();
        }
        this.server.afterInitRoutes();
        this.server.use(this.server.onPageNotFound);
        this.server.use(this.server.onError);
        this.initTasks();
        return this.server;
    }
    listen() {
        if (this.settings.port) {
            this.server
                .listen(this.settings.port, () => this.logger.info(`listening HTTP at ${this.settings.port}`))
                .on("error", (err) => this.logger.error(err));
        }
    }
    initSysHandlers() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        if ((_a = this.settings.options) === null || _a === void 0 ? void 0 : _a.accessLog) {
            this.logger.info("[handler] AccessLogger registered");
            this.server.use(Handler_1.Handler.accessLogger(this.settings.name));
        }
        if ((_b = this.settings.options) === null || _b === void 0 ? void 0 : _b.cors) {
            this.logger.info("[handler] CorsHandler registered");
            this.server.use(Handler_1.Handler.corsHandler(typeof ((_c = this.settings.options) === null || _c === void 0 ? void 0 : _c.cors) === "boolean" ? undefined : (_d = this.settings.options) === null || _d === void 0 ? void 0 : _d.cors));
        }
        if (((_e = this.settings.options) === null || _e === void 0 ? void 0 : _e.jsonBodyParser) || ((_f = this.settings.options) === null || _f === void 0 ? void 0 : _f.bodyParser)) {
            this.logger.info("[handler] JsonBodyParser registered");
            this.server.use(Handler_1.Handler.jsonBodyParser(typeof ((_g = this.settings.options) === null || _g === void 0 ? void 0 : _g.jsonBodyParser) === "boolean" ? undefined : (_h = this.settings.options) === null || _h === void 0 ? void 0 : _h.jsonBodyParser));
        }
        if (((_j = this.settings.options) === null || _j === void 0 ? void 0 : _j.urlEncodedBodyParser) || ((_k = this.settings.options) === null || _k === void 0 ? void 0 : _k.bodyParser)) {
            this.logger.info("[handler] UrlEncodedBodyParser registered");
            this.server.use(Handler_1.Handler.urlEncodedBodyParser(typeof ((_l = this.settings.options) === null || _l === void 0 ? void 0 : _l.urlEncodedBodyParser) === "boolean" ? undefined : (_m = this.settings.options) === null || _m === void 0 ? void 0 : _m.urlEncodedBodyParser));
        }
    }
    initRoutes() {
        this.settings.routes.map(router => {
            const controller = Injector_1.Injector.resolve(router);
            Decorator_1.Metadata.getStorage()
                .routes.filter(route => route.target === router)
                .map(route => this.initHandler(controller, route));
        });
    }
    initHandler(controller, route) {
        var _a;
        const basePath = ((_a = this.settings.basePath) === null || _a === void 0 ? void 0 : _a.endsWith("/")) ? this.settings.basePath.slice(0, -1) : this.settings.basePath || "";
        const path = (basePath => (route.path.startsWith("/") ? `${basePath}${route.path}` : `${basePath}/${route.path}`))(basePath);
        this.logger.info(`[router] ${route.action} ${path} - ${route.target.name}.${route.method}`);
        const handlers = [
            [router_1.MIDDLEWARE_PRIORITY_BEFORE_HANDLER, Handler_1.Handler.beforeHandler(controller)],
            [router_1.MIDDLEWARE_PRIORITY_ACTION_HANDLER, Handler_1.Handler.actionHandler(controller, route)],
            [router_1.MIDDLEWARE_PRIORITY_AFTER_HANDLER, Handler_1.Handler.afterHandler(controller)],
        ];
        Decorator_1.Metadata.getStorage()
            .middlewares.filter(middleware => middleware.target === route.target && middleware.method === route.method)
            .forEach(middleware => {
            handlers.push([middleware.options.priority || router_1.MIDDLEWARE_PRIORITY_ACTION_HANDLER - 100, middleware.handler]);
        });
        this.server[route.action.toLowerCase()](path, controller.beforeMiddleware(this), ...handlers.sort((a, b) => a[0] - b[0]).map(e => e[1]), controller.afterMiddleware(this), controller.render(this), Handler_1.Handler.errorHandler(controller, this), Handler_1.Handler.httpErrorHandler(controller));
    }
    initTasks() {
        if (!this.settings.tasks) {
            this.logger.info("[task] No task registered");
            return;
        }
        Decorator_1.Metadata.getStorage()
            .tasks.filter(task => this.settings.tasks.includes(task.target))
            .forEach(task => {
            this.initTask(task);
        });
    }
    initTask(meta) {
        const readableType = `${meta.type.slice(0, 1)}${meta.type.slice(1).toLowerCase()}`;
        const taskOptions = (() => {
            if (meta.type === Task_types_1.TaskType.Repeat)
                return `(${meta.options.nextInvokeDelay})`;
            return "";
        })();
        this.logger.info(`[task] ${readableType}${taskOptions} - ${meta.target.name}.${meta.method}`);
        const task = Injector_1.Injector.resolve(meta.target);
        const invoker = new Task_invoker_1.TaskInvoker(task, meta.method, meta.options, this.logger);
        invoker.init();
    }
    initSwagger() {
        var _a;
        if (this.swaggerGenerator) {
            const swaggerDocument = this.swaggerGenerator.generateSwaggerDocs();
            if (!swaggerDocument || typeof swaggerDocument !== "object") {
                this.logger.error("[swagger] Invalid Swagger document generated");
                return;
            }
            const swaggerPath = ((_a = this.settings.swagger) === null || _a === void 0 ? void 0 : _a.uri) || "/api-docs";
            try {
                this.server.use(swaggerPath, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
                this.logger.info(`[swagger] Swagger UI available at ${swaggerPath}`);
            }
            catch (error) {
                this.logger.error(`[swagger] Error setting up Swagger UI: ${error.message}`);
            }
        }
        else {
            this.logger.info("[swagger] Swagger documentation is disabled");
        }
    }
}
exports.Cyan = Cyan;
//# sourceMappingURL=Application.js.map