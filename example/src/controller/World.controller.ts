import { Status as HttpStatus, Response } from "cyan/dist/http";
import { Get } from "cyan/dist/router";
import { BaseController } from "./Base.controller";

export class WorldController extends BaseController {
  @Get("/world/ok")
  helloString(): Response {
    return Response.ok("OK");
  }

  @Get("/world/bad")
  helloJson(): Response {
    return Response.done(HttpStatus.BadRequest, "Bad!");
  }

  @Get("/world/error")
  helloError(): any {
    throw Response.notImplemented();
  }
}
