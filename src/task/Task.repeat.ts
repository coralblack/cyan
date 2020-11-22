import { TaskOptions, TaskType } from "./Task.types";
import { Metadata } from "../core/Decorator";

export interface RepeatOptions {
  interval: number;
}

export function Repeat(delayOrOptions: RepeatOptions | number): MethodDecorator {
  return function RepeatInner(target: any, method: string) {
    const options: RepeatOptions = typeof delayOrOptions === "number" ? { interval: delayOrOptions } : delayOrOptions;

    const taskOptions: TaskOptions = {
      invokeCount: Infinity,
      nextInvokeDelay: options.interval,
    };

    Metadata.getStorage().tasks.push({
      target: target.constructor,
      method,
      type: TaskType.Repeat,
      options: taskOptions,
    });
  };
}