import { Repeat } from "cyan/dist/task";
import { HelloService } from "src/service/Hello.service";
import { Inject } from "../../../dist/core";

export class RepeatTask {
  constructor(@Inject() private readonly helloService: HelloService) {
  }

  @Repeat(2560)
  async run(): Promise<void> {
    // eslint-disable-next-line no-console
    // console.log(`RepeatTask::run(), ${new Date().getSeconds()}`);

    await this.helloService.model();

    if (new Date().getSeconds() % 5 === 0) {
      // throw new Error("xxx");
    }
  }
}