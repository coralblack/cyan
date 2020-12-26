import { Repeat } from "@coralblack/cyan/dist/task";
import { Inject } from "../../../dist/core";
import { HelloService } from "../service/Hello.service";

export class RepeatTask {
  constructor(@Inject() private readonly helloService: HelloService) {
  }

  @Repeat(2560)
  async run(): Promise<void> {
    // eslint-disable-next-line no-console
    // console.log(`RepeatTask::run(), ${new Date().getSeconds()}`);

    await this.helloService.model(true);

    if (new Date().getSeconds() % 5 === 0) {
      // throw new Error("xxx");
    }
  }
}