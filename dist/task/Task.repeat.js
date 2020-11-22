"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repeat = void 0;
const Task_types_1 = require("./Task.types");
const Decorator_1 = require("../core/Decorator");
function Repeat(delayOrOptions) {
    return function RepeatInner(target, method) {
        const options = typeof delayOrOptions === "number" ? { interval: delayOrOptions } : delayOrOptions;
        const taskOptions = {
            invokeCount: Infinity,
            nextInvokeDelay: options.interval,
        };
        Decorator_1.Metadata.getStorage().tasks.push({
            target: target.constructor,
            method,
            type: Task_types_1.TaskType.Repeat,
            options: taskOptions,
        });
    };
}
exports.Repeat = Repeat;
//# sourceMappingURL=Task.repeat.js.map