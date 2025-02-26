/* eslint-disable @typescript-eslint/no-unused-vars */
import { ok as assert } from "assert";
import { Inject } from "@coralblack/cyan/dist/core";
import { HttpHelper } from "@coralblack/cyan/dist/helper";
import { HttpMethod, HttpRequest } from "@coralblack/cyan/dist/http";
import { HttpResponder, HttpResponse } from "@coralblack/cyan/dist/http/Http.response";
import {
  BodyParam,
  ContextAttributeKeyType,
  ContextParam,
  ContextParamAttributes,
  Get,
  HeaderParam,
  Middleware,
  PathParam,
  Post,
  QueryParam,
  SystemParam,
} from "@coralblack/cyan/dist/router";
import { BaseController } from "./Base.controller";
import { AuthorizedContext, BasicAuthMiddleware, CyanRequestContext } from "./middleware/BasicAuthMiddleware";
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

  async afterHandle(request: HttpRequest, response: any, executionContext: ContextParamAttributes): Promise<HttpResponse> {
    const authContext = executionContext.authContext;

    console.log("controller AfterHandle Example", { executionContext });

    return new Promise(res => {
      return res(response as HttpResponse);
    });
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
        bigint: 1,
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

      const test = async (method: HttpMethod, path: string, data: any, opts: { contains?: string; equal?: string; debug?: boolean }) => {
        const bigintPayload = {
          method: method,
          url: `http://127.0.0.1:9090${path}`,
        };

        const res = (
          await this.httpHelper.request({
            ...bigintPayload,
            data: method !== HttpMethod.Get ? data : undefined,
            params: method === HttpMethod.Get ? data : undefined,
          })
        ).body;

        if (opts.contains) {
          assert(
            String(res).includes(opts.contains),
            `${method} ${path} ${JSON.stringify(data)} ${JSON.stringify(opts)} -> ${String(res)}`
          );
        }

        if (opts.equal) {
          assert(res === opts.equal, `${method} ${path} ${JSON.stringify(data)} ${JSON.stringify(opts)} -> ${String(res)}`);
        }
      };

      // BigInt
      await test(HttpMethod.Post, "/test/bigint/case1", { val: 0 }, { equal: "RES:0" });
      await test(HttpMethod.Post, "/test/bigint/case1", { val: 1 }, { equal: "RES:1" });
      await test(HttpMethod.Post, "/test/bigint/case1", { val: "" }, { contains: "Missing BODY" });
      await test(HttpMethod.Post, "/test/bigint/case1", { val: "1x" }, { contains: "Invalid BODY" });
      await test(HttpMethod.Post, "/test/bigint/case1", { val: "x1" }, { contains: "Invalid BODY" });

      // Enum
      await test(HttpMethod.Post, "/test/enum/case1", { val: FooBarNum.Bar }, { equal: `RES:${FooBarNum.Bar}` });
      await test(HttpMethod.Post, "/test/enum/case1", { val: FooBarStr.Foo }, { contains: "Invalid BODY" });
      await test(HttpMethod.Post, "/test/enum/case2", { val: FooBarNum.Foo }, { equal: `RES:${FooBarNum.Foo}` });
      await test(HttpMethod.Post, "/test/enum/case2", { val: [FooBarNum.Foo] }, { equal: `RES:${FooBarNum.Foo}` });
      await test(
        HttpMethod.Post,
        "/test/enum/case2",
        { val: [FooBarNum.Foo, FooBarNum.Bar] },
        { equal: `RES:${FooBarNum.Foo},${FooBarNum.Bar}` }
      );
      await test(HttpMethod.Post, "/test/enum/case2", { val: [FooBarNum.Foo, FooBarStr.Bar] }, { contains: "Invalid BODY" });
      await test(HttpMethod.Post, "/test/enum/case2", undefined, { contains: "Missing BODY" });
      await test(HttpMethod.Post, "/test/enum/case2", { val: [] }, { contains: "Missing BODY" });
      await test(HttpMethod.Get, "/test/enum/case3", { val: FooBarNum.Foo }, { equal: `RES:${FooBarNum.Foo}` });
      await test(
        HttpMethod.Get,
        "/test/enum/case3",
        { val: [FooBarNum.Foo, FooBarNum.Bar].join(",") },
        { equal: `RES:${FooBarNum.Foo},${FooBarNum.Bar}` }
      );
      await test(HttpMethod.Get, "/test/enum/case3", { val: [] }, { contains: "Missing QUERY" });
      await test(HttpMethod.Get, "/test/enum/case3", {}, { contains: "Missing QUERY" });

      // SysParam
      await test(HttpMethod.Post, "/test/sys/req/method", {}, { contains: "RES:POST" });
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

  @Post("/test/bigint/case1")
  testBigintCase1(@BodyParam("val", { required: true, type: BigInt }) val: bigint): string {
    return `RES:${val}`;
  }

  @Post("/test/enum/case1")
  testEnumCase1(@BodyParam("val", { required: true, type: "ENUM", enum: FooBarNum }) val: FooBarNum): string {
    return `RES:${val}`;
  }

  @Post("/test/enum/case2")
  testEnumCase2(@BodyParam("val", { required: true, type: "ENUM", enum: FooBarNum, array: true }) val: FooBarNum[]): string {
    return `RES:${val.join(",")}`;
  }

  @Get("/test/enum/case3")
  testEnumCase3(
    @QueryParam("val", { required: true, type: "ENUM", enum: FooBarNum, array: true, delimiter: "," }) val: FooBarNum[]
  ): string {
    return `RES:${val.join(",")}`;
  }

  @Post("/test/sys/req/method")
  testSysReqMethod(
    @SystemParam({ type: "REQ", attr: "method" }) reqMethod: HttpMethod,
    @SystemParam({ type: "REQ", attr: "remoteAddress" }) remoteAddress: string
  ): string {
    return `RES:${reqMethod}:${remoteAddress}`;
  }

  @Get("/test/middleware/class/instance")
  @Middleware((req, res, next) => {
    req.executionContext.authContext = { email: "myemail@naver.com", id: "1111", lastLoginAt: new Date() };
    req.executionContext.requestContext = { foo: "foo", bar: 11, boo: { innerFoo: "innerFoo" } };

    // NOTE: Compile Error
    // req.executionContext.invalidAttribute = "test";

    const a: ContextAttributeKeyType = "authContext";
    const b: ContextAttributeKeyType = "authContext";
    const test: ContextAttributeKeyType = "authContext";

    return next();
  })
  testMiddlewareTypeValidation(
    @ContextParam({ type: "CONTEXT", attr: "requestContext" }) myContext: CyanRequestContext,
    @ContextParam({ type: "CONTEXT", attr: "authContext", validate: (auth: AuthorizedContext) => !!auth.email })
    authContext: AuthorizedContext
  ): {
    context: CyanRequestContext;
    authContext: AuthorizedContext;
  } {
    return { context: myContext, authContext };
  }

  @Get("/test/middleware/basic-auth")
  @Middleware(BasicAuthMiddleware)
  basicAuthMiddleware(
    @ContextParam({ type: "CONTEXT", attr: "authContext", validate: (auth: AuthorizedContext) => !!auth.email })
    authContext: AuthorizedContext
  ): {
    authContext: AuthorizedContext;
  } {
    return { authContext };
  }
}
