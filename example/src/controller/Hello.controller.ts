import { assert } from "console";
import { Inject } from "cyan/dist/core";
import { HttpHelper } from "cyan/dist/helper";
import { Method as HttpMethod } from "cyan/dist/http";
import { BodyParam, Get, HeaderParam, PathParam, QueryParam } from "cyan/dist/router";
import { BaseController } from "./Base.controller";
import { HelloService } from "../service/Hello.service";

interface HttpEchoPost {
  foo: string;
  bar: {
    baz: string;
    foz: number;
  };
}

export class HelloController extends BaseController {
  constructor(
    @Inject() private readonly helloService: HelloService,
    @Inject() private readonly httpHelper: HttpHelper
  ) {
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

    const data: HttpEchoPost = {
      foo: "foo",
      bar: {
        baz: "baz",
        foz: 1004,
      },
    };

    const echo = await this.httpHelper.post<HttpEchoPost>({
      url: "https://postman-echo.com/post",
      data,
    });

    assert(echo.request.method === HttpMethod.Post);
    assert(echo.body);

    return { hello: "world" };
  }

  @Get("/hello/error")
  helloError(): never {
    throw new Error("Unknown error");
  }
}
