import { TaskOptions } from "./Task.types";
import { Logger } from "../core";
export declare class TaskInvoker {
    private readonly target;
    private readonly options;
    private readonly logger;
    private invokeEnabled;
    constructor(target: Function, options: TaskOptions, logger: Logger);
    init(): void;
    private run;
}
