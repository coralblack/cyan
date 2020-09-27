import { Inject } from "cyan/dist/core";
import { Get } from "cyan/dist/http";
import { BodyParam, HeaderParam, PathParam, QueryParam } from "cyan/dist/router";
import { BaseController } from "./Base.controller";
import { HelloService } from "../service/Hello.service";

export class HelloController extends BaseController {
  constructor(@Inject() private readonly helloService: HelloService) {
    super();
  }

  @Get("/hello/string/:foo?")
  helloString(
    @PathParam("foo", { required: true }) foo: string,
    @QueryParam("bar", { required: true }) bar: number,
    @BodyParam("foo.bar.baz", { required: true }) baz: number,
    @HeaderParam("content-type", { required: true }) foz: string
  ): string {
    return `HiHi : ${foo || "path-foo-none"} : ${bar || "query-bar-none"}: ${baz || "query-baz-none"} : ${foz} : ${this.helloService.calc(bar, baz)}`;
  }

  @Get("/hello/json")
  async helloJson(): Promise<any> {
    await this.helloService.model();

    return { hello: "world" };
  }

  @Get("/hello/error")
  helloError(): never {
    throw new Error("Unknown error");
  }
}
