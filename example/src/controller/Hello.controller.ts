/* eslint-disable @typescript-eslint/no-unused-vars */
import { assert } from "console";
import { Inject } from "@coralblack/cyan/dist/core";
import { HttpHelper } from "@coralblack/cyan/dist/helper";
import { HttpMethod } from "@coralblack/cyan/dist/http";
import { HttpResponder } from "@coralblack/cyan/dist/http/Http.response";
import { BodyParam, Get, HeaderParam, PathParam, QueryParam } from "@coralblack/cyan/dist/router";
import { BaseController } from "./Base.controller";
import { HttpError } from "../../../dist/http/Http.error";
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
  Bar = 2,
}

enum FooBarStr {
  Foo = "FOO",
  Bar = "BAR",
}

enum FooBarMix {
  Foo = 1,
  Bar = "BAR",
}

class CustomClass {
  constructor(public readonly message: string) {}
}

const DEFAULT_VAL = "DEFAULT_VAL";

export class HelloController extends BaseController {
  constructor(@Inject() private readonly helloService: HelloService, @Inject() private readonly httpHelper: HttpHelper) {
    super();
  }

  @Get("/hello/string/:foo?")
  async helloString(
    @PathParam("foo", { required: true }) foo: string,
    @QueryParam("bar", { required: true }) bar: number,
    @BodyParam("foo.bar.baz", { required: true }) baz: number,
    @BodyParam("bool", { required: false }) bool: boolean,
    @HeaderParam("content-type", { required: true }) foz: string,
    @BodyParam("enum.num", { type: "ENUM", enum: FooBarNum }) fooBarNum: FooBarNum,
    @BodyParam("enum.str", { type: "ENUM", enum: FooBarStr }) fooBarStr: FooBarStr,
    @BodyParam("enum.mix", { type: "ENUM", enum: FooBarMix }) fooBarMix: FooBarMix,
    @BodyParam("default", { default: DEFAULT_VAL }) defaultVal: string,
    @BodyParam("invalidMsg", { invalid: "INVALID!" }) _invalidMsg: FooBarNum,
    @BodyParam("invalidFun", { invalid: (v: string) => `INVALID(${v})` }) _invalidFun: FooBarNum,
    @BodyParam("invalidFunTh", { invalid: (v: string) => new HttpError(400, `INVALID(${v})`) }) _invalidFunTh: FooBarNum,
    @BodyParam("validateStr", { validate: (e: string) => e === "vvs" }) _validateStr: string,
    @BodyParam("validateErr", {
      validate: (e: string) => {
        if (e !== "vvs") throw new Error("General Error");
      },
    })
    _validateErr: string,
    @BodyParam("validateBad", {
      validate: (e: string) => {
        if (e !== "vvs") throw HttpResponder.badRequest({ code: "VVS", message: "VvS" });
      },
    })
    _validateBad: string
  ): Promise<string> {
    const payload = {
      method: HttpMethod.Get,
      url: "http://127.0.0.1:9090/hello/string/DO-NOT-RECUR",
      params: { bar: 1234 },
      data: {
        foo: { bar: { baz: 1234, bool: bool } },
        bool: true,
        enum: {
          num: FooBarNum.Bar,
          str: "FOO",
          mix: FooBarMix.Foo,
        },
      },
    };

    if (foo !== "DO-NOT-RECUR") {
      assert((await this.httpHelper.request(payload)).status === 200, "Assert 200");

      // DefaultVal
      assert(defaultVal === DEFAULT_VAL, "Assert defaultVal");

      // Bool
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, bool: true } })).body as string).includes("{B-T}"),
        "Assert bool 1"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, bool: false } })).body as string).includes("{B-F}"),
        "Assert bool 2"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, bool: "true" } })).body as string).includes("{B-T}"),
        "Assert bool 3"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, bool: "False" } })).body as string).includes("{B-F}"),
        "Assert bool 4"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, bool: "1" } })).body as string).includes("{B-T}"),
        "Assert bool 5"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, bool: "0" } })).body as string).includes("{B-F}"),
        "Assert bool 6"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, bool: 1 } })).body as string).includes("{B-T}"),
        "Assert bool 7"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, bool: 0 } })).body as string).includes("{B-F}"),
        "Assert bool 8"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, bool: "xx" } })).body as string).includes(
          "Invalid BODY: bool"
        ),
        "Assert bool 9"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, bool: "12" } })).body as string).includes(
          "Invalid BODY: bool"
        ),
        "Assert bool 10"
      );

      // Invalid Message
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, invalidMsg: "VVS" } })).body as string) === "INVALID!",
        "Assert invalid 1"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, invalidFun: "VVS" } })).body as string) === "INVALID(VVS)",
        "Assert invalid 2"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, invalidFunTh: "VVSS" } })).body as string) ===
          "INVALID(VVSS)",
        "Assert invalid 3"
      );
      // Validate
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, validateStr: "vvs" } })).body as string).includes("HiHi"),
        "Assert validate 1"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, validateStr: "vvs!" } })).body as string).includes(
          "Invalid BODY: validateStr"
        ),
        "Assert validate 2"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, validateErr: "vvs" } })).body as string).includes("HiHi"),
        "Assert validate 3"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, validateErr: "vvs!" } })).body as string).includes(
          "Invalid BODY: validateErr"
        ),
        "Assert validate 4"
      );
      assert(
        ((await this.httpHelper.request({ ...payload, data: { ...payload.data, validateBad: "vvs" } })).body as string).includes("HiHi"),
        "Assert validate 5"
      );
      assert(
        (
          (await this.httpHelper.request({ ...payload, data: { ...payload.data, validateBad: "vvs!" } })).body as {
            code: string;
            message: string;
          }
        ).message === "VvS",
        "Assert validate 6"
      );

      // Enum
      assert(
        (
          (await this.httpHelper.request({ ...payload, data: { ...payload.data, enum: { ...payload.data.enum, num: "FOO" } } }))
            .body as string
        ).includes("Invalid BODY: enum.num"),
        "Assert enum 1"
      );
      assert(
        (
          (await this.httpHelper.request({ ...payload, data: { ...payload.data, enum: { ...payload.data.enum, str: 1 } } })).body as string
        ).includes("Invalid BODY: enum.str"),
        "Assert enum 2"
      );
      assert(
        (
          (await this.httpHelper.request({ ...payload, data: { ...payload.data, enum: { ...payload.data.enum, mix: "FOO" } } }))
            .body as string
        ).includes("Invalid BODY: enum.mix"),
        "Assert enum 3"
      );
    } else {
      await this.helloService.model();
    }

    return `HiHi : ${bool === true ? "{B-T}" : bool === false ? "{B-F}" : "{B-N}"} : ${foo || "path-foo-none"} : ${
      bar || "query-bar-none"
    }: ${baz || "query-baz-none"} : ${foz} : ${this.helloService.calc(bar, baz)} : ${fooBarNum || ""}:${fooBarStr || ""}:${
      fooBarMix || ""
    }`;
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

    assert(echo.request.method === HttpMethod.Post, "HttpMethod.Post");
    assert(echo.body, "echo.body");

    return { hello: "world" };
  }

  @Get("/hello/error")
  helloError(): never {
    throw new Error("Unknown error");
  }

  @Get("/hello/error/cls")
  helloCustomClass(): never {
    throw new CustomClass("Throw Custom Class");
  }
}
