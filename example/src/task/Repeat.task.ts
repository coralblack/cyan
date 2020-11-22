import { Repeat } from "cyan/dist/task";

export class RepeatTask {
  @Repeat(2560)
  run(): void {
    // eslint-disable-next-line no-console
    // console.log(`RepeatTask::run(), ${new Date().getSeconds()}`);

    if (new Date().getSeconds() % 5 === 0) {
      // throw new Error("xxx");
    }
  }
}