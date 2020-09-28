/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiController, Status as HttpStatus, Response } from "cyan/dist/http";
import { Get, Middleware, MIDDLEWARE_PRIORITY_ACTION_HANDLER } from "cyan/dist/router";

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
    return Response.done(HttpStatus.Created, { hello: "world" });
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
    throw Response.notFound.code("ERR").message("Ethrow")();
  }

  @Get("/json/ethro")
  helloErrThro(): never {
    throw Response.notFound.code("ERR").message("Ethrow");
  }

  @Get("/json/middleware")
  @Middleware((req, res, next) => {
    res.status(200).send("gotcha").end();
  })
  helloMiddleware(): never {
    throw new Error("It's a proxied request.");
  }

  @Get("/json/middleware2")
  @Middleware((req, res, next) => {
    res.status(200).send({ ...res.preparedResponse, world: "hello" }).end();
  }, { priority: MIDDLEWARE_PRIORITY_ACTION_HANDLER + 1 })
  helloMiddlewareAfter(): any {
    return { hello: "world" };
  }
}
