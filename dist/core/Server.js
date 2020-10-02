"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const Logger_1 = require("./Logger");
const Http_error_1 = require("../http/Http.error");
const Http_response_1 = require("../http/Http.response");
class Server {
    constructor(cyan) {
        this.cyan = cyan;
        this._server = express_1.default();
    }
    getServer() {
        return this._server;
    }
    beforeInitSys() { }
    afterInitSys() { }
    beforeInitRoutes() { }
    afterInitRoutes() { }
    onPageNotFound(request, response, next) {
        response.status(404).send(`Page Not Found. (${request.method} ${request.path})`).end();
    }
    onError(error, request, response, next) {
        if (error instanceof Http_error_1.HttpError) {
            response.status(error.status).send(error.content || error.default).set(error.headers).end();
        }
        else if (error instanceof Http_response_1.HttpResponse) {
            response.status(error.status).send(error.content).set(error.headers).end();
        }
        else {
            Logger_1.Logger.getInstance().error(error);
            response.status(500).send("An error has occurred.").end();
        }
    }
    listen(...args) {
        return this._server.listen.call(this._server, ...args);
    }
    get(...args) {
        return this._server.get.call(this._server, ...args);
    }
    post(...args) {
        return this._server.post.call(this._server, ...args);
    }
    put(...args) {
        return this._server.put.call(this._server, ...args);
    }
    patch(...args) {
        return this._server.patch.call(this._server, ...args);
    }
    delete(...args) {
        return this._server.delete.call(this._server, ...args);
    }
    use(...args) {
        return this._server.use.call(this._server, ...args);
    }
    enable(setting) {
        return this._server.enable(setting);
    }
    enabled(setting) {
        return this._server.enabled(setting);
    }
    disable(setting) {
        return this._server.disable(setting);
    }
    disabled(setting) {
        return this._server.disabled(setting);
    }
    set(setting, val) {
        return this._server.set(setting, val);
    }
    engine(ext, fn) {
        return this._server.engine(ext, fn);
    }
}
exports.Server = Server;
//# sourceMappingURL=Server.js.map