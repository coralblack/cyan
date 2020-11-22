import { TaskOptions } from "./Task.types";
import { Logger } from "../core";
import { delay } from "../util";

export class TaskInvoker {
  private invokeEnabled = true;

  constructor(private readonly target: Function, private readonly options: TaskOptions, private readonly logger: Logger) {}

  public init(): void {
    this.run()
      .then(() => {})
      .catch((err) => {
      // eslint-disable-next-line no-console
        console.error("Never be here!", err);
      });
  }

  private async run(): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (this.invokeEnabled) {
      try {
        await this.target();
        await delay(this.options.nextInvokeDelay);
      } catch (err) {
        this.logger.error(err);
        await delay(this.options.nextErrorDelay || (10 * 1000));
      }
    }
  }
}