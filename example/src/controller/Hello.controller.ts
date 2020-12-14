import { assert } from "console";
import { Inject } from "@coralblack/cyan/dist/core";
import { HttpHelper } from "@coralblack/cyan/dist/helper";
import { HttpMethod } from "@coralblack/cyan/dist/http";
import { BodyParam, Get, HeaderParam, PathParam, QueryParam } from "@coralblack/cyan/dist/router";
import { BaseController } from "./Base.controller";
import { HelloService } from "../service/Hello.service";

interface HttpEchoPost {
  foo: string;
  bar: {
    baz: string;
    foz: number;
  };
}

enum FooBarNum {
  Foo = 1,
  Bar = 2
}

enum FooBarStr {
  Foo = "FOO",
  Bar = "BAR"
}

enum FooBarMix {
  Foo = 1,
  Bar = "BAR"
}

export class HelloController extends BaseController {
  constructor(
    @Inject() private readonly helloService: HelloService,
    @Inject() private readonly httpHelper: HttpHelper
  ) {
    super();
  }

  @Get("/hello/string/:foo?")
  async helloString(
    @PathParam("foo", { required: true }) foo: string,
    @QueryParam("bar", { required: true }) bar: number,
    @BodyParam("foo.bar.baz", { required: true }) baz: number,
    @BodyParam("bool", { required: true }) bool: boolean,
    @HeaderParam("content-type", { required: true }) foz: string,
    @BodyParam("enum.num", { type: "ENUM", enum: FooBarNum }) fooBarNum: FooBarNum,
    @BodyParam("enum.str", { type: "ENUM", enum: FooBarStr }) fooBarStr: FooBarStr,
    @BodyParam("enum.mix", { type: "ENUM", enum: FooBarMix }) fooBarMix: FooBarMix
  ): Promise<string> {
    const payload = {
      method: HttpMethod.Get,
      url: "http://127.0.0.1:9090/hello/string/DO-NOT-RECUR",
      params: { bar: 1234 },
      data: {
        foo: { bar: { baz: 1234, bool: bool } },
        enum: {
          num: FooBarNum.Bar,
          str: "FOO",
          mix: FooBarMix.Foo,
        }, 
      },
    };

    if (foo !== "DO-NOT-RECUR") {
      assert((await this.httpHelper.request(payload)).status === 200);

      // Enum
      assert(((await this.httpHelper.request({ ...payload, data: { ...payload.data, enum: { ...payload.data.enum, num: "FOO" } } })).body as string).includes("Invalid BODY: enum.num"), "Assert enum 1");
      assert(((await this.httpHelper.request({ ...payload, data: { ...payload.data, enum: { ...payload.data.enum, str: 1 } } })).body as string).includes("Invalid BODY: enum.str"), "Assert enum 2");
      assert(((await this.httpHelper.request({ ...payload, data: { ...payload.data, enum: { ...payload.data.enum, mix: "FOO" } } })).body as string).includes("Invalid BODY: enum.mix"), "Assert enum 3");
    } else {
      await this.helloService.model();
    }

    return `HiHi : ${foo || "path-foo-none"} : ${bar || "query-bar-none"}: ${baz || "query-baz-none"} : ${foz} : ${this.helloService.calc(bar, baz)} : ${fooBarNum}:${fooBarStr}:${fooBarMix}`;
  }

  @Get("/hello/json")
  async helloJson(
    @QueryParam("arr", { delimiter: ",", required: true, type: BigInt }) arr1: bigint[],
    @QueryParam("arr", { delimiter: ",", required: true, type: Number }) arr2: number[],
    @QueryParam("arr", { delimiter: ",", required: true, type: String }) arr3: string[],
    @QueryParam("arr", { delimiter: ",", required: true, type: Boolean }) arr4: boolean[],
    @QueryParam("drr", { delimiter: ",", required: true, type: Date }) arr5: Date[]
  ): Promise<any> {
    // eslint-disable-next-line no-console
    console.log(arr1, arr2, arr3, arr4, arr5);

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
