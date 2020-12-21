/* eslint-disable @typescript-eslint/no-unsafe-return */

import { HttpResponder, HttpResponse, Status as HttpStatus } from "@coralblack/cyan/dist/http";
import { Get, QueryParam } from "@coralblack/cyan/dist/router";
import { BaseController } from "./Base.controller";

export class WorldController extends BaseController {
  @Get("/world/ok")
  helloString(): HttpResponse {
    return HttpResponder.ok("OK");
  }

  @Get("/world/bad")
  helloJson(): HttpResponse {
    return HttpResponder.done(HttpStatus.BadRequest, "Bad!");
  }

  @Get("/world/error")
  helloError(): any {
    throw HttpResponder.notImplemented();
  }

  @Get("/world/req")
  helloReq(
    @QueryParam("foo", { required: true, missing: "Missing foo!!" }) foo: string,
    @QueryParam("bar", { invalid: "Invalid bar!!" }) bar: number,
    @QueryParam("baz", { invalid: "Invalid baz!!" }) baz: Date,
    @QueryParam("bab", { invalid: "Invalid bab!!" }) bab: bigint,
    @QueryParam("foz", { invalid: "Invalid foz!!" }) foz: boolean
  ): any {
    return { 
      foo, bar, baz, bab: bab ? String(bab) : bab, foz,
      fooT: typeof foo, barT: typeof bar, bazT: typeof baz, babT: typeof bab, fozT: typeof foz,
    };
  }
}
