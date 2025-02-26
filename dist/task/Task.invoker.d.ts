import { TaskOptions } from "./Task.types";
import { Logger } from "../core";
export declare class TaskInvoker<T extends Record<string | symbol, Function>> {
    private readonly target;
    private readonly method;
    private readonly options;
    private readonly logger;
    private invokeEnabled;
    constructor(target: T, method: keyof T & (string | symbol), options: TaskOptions, logger: Logger);
    init(): void;
    private run;
}
