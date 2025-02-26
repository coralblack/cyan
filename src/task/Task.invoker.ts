import { TaskOptions } from "./Task.types";
import { Logger } from "../core";
import { delay } from "../util";

export class TaskInvoker<T extends Record<string | symbol, Function>> {
  private invokeEnabled = true;

  constructor(
    private readonly target: T,
    private readonly method: keyof T & (string | symbol),
    private readonly options: TaskOptions,
    private readonly logger: Logger
  ) {}

  public init(): void {
    this.run()
      .then(() => {})
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error("Never be here!", err);
      });
  }

  private async run(): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (this.invokeEnabled) {
      try {
        await this.target[this.method].call(this.target);
        await delay(this.options.nextInvokeDelay);
      } catch (err) {
        this.logger.error(err);
        await delay(this.options.nextErrorDelay || 10 * 1000);
      }
    }
  }
}
