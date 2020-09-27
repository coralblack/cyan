import { Inject } from "cyan/dist/core";
import { HelloModel } from "../model/Hello.model";

export class HelloService {
  constructor(@Inject() private readonly helloModel: HelloModel) {}

  calc(a: number, b: number): number {
    return a + b;
  }

  async model(): Promise<void> {
    return this.helloModel.test();
  }
}