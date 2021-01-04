"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskInvoker = void 0;
const util_1 = require("../util");
class TaskInvoker {
    constructor(target, method, options, logger) {
        this.target = target;
        this.method = method;
        this.options = options;
        this.logger = logger;
        this.invokeEnabled = true;
    }
    init() {
        this.run()
            .then(() => { })
            .catch(err => {
            console.error("Never be here!", err);
        });
    }
    async run() {
        while (this.invokeEnabled) {
            try {
                await this.target[this.method].call(this.target);
                await util_1.delay(this.options.nextInvokeDelay);
            }
            catch (err) {
                this.logger.error(err);
                await util_1.delay(this.options.nextErrorDelay || 10 * 1000);
            }
        }
    }
}
exports.TaskInvoker = TaskInvoker;
//# sourceMappingURL=Task.invoker.js.map