import { ApiController, Status as HttpStatus, Response } from "cyan/dist/http";
import { Get } from "cyan/dist/router";

export class JsonController extends ApiController {
  @Get("/json/string")
  helloString(): string {
    return "HiHi";
  }

  @Get("/json/json")
  helloJson(): any {
    return { hello: "world" };
  }

  @Get("/json/resp")
  helloResp(): Response {
    return new Response(HttpStatus.Created, { hello: "world" });
  }

  @Get("/json/error")
  helloError(): never {
    throw new Error("Unknown error");
  }

  @Get("/json/eresp")
  helloErrResp(): any {
    return Response.badRequest("Bad!");
  }

  @Get("/json/ethrow")
  helloErrThrow(): never {
    throw Response.badRequest({ hello: "bad" });
  }
}
