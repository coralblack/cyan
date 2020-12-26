import { Inject } from "@coralblack/cyan/dist/core";
import { HelloModel } from "../model/Hello.model";

export class HelloService {
  constructor(@Inject() private readonly helloModel: HelloModel) {}

  calc(a: number, b: number): number {
    return a + b;
  }

  async model(skip?: boolean): Promise<void> {
    if (skip) return;

    return this.helloModel.test();
  }
}