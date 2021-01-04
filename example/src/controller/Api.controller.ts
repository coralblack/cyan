/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiController as BaseApiController, HttpResponder, HttpResponse, Status as HttpStatus } from "@coralblack/cyan/dist/http";
import { Get, Middleware, MIDDLEWARE_PRIORITY_ACTION_HANDLER, QueryParam } from "@coralblack/cyan/dist/router";

export class ApiController extends BaseApiController {
  @Get("/api/string")
  helloString(): string {
    return "HiHi";
  }

  @Get("/api/json")
  helloJson(): any {
    return { hello: "world" };
  }

  @Get("/api/req")
  helloReq(@QueryParam("foo", { required: true }) foo: string): any {
    return { foo };
  }

  @Get("/api/resp")
  helloResp(): HttpResponse {
    return HttpResponder.done(HttpStatus.Created, { hello: "world" });
  }

  @Get("/api/error")
  helloError(): never {
    throw new Error("Unknown error");
  }

  @Get("/api/eresp")
  helloErrResp(): any {
    return HttpResponder.badRequest("Bad!");
  }

  @Get("/api/ethrow")
  helloErrThrow(): never {
    throw HttpResponder.notFound.code("ERR").message("Ethrow")();
  }

  @Get("/api/ethro")
  helloErrThro(): never {
    throw HttpResponder.notFound.code("ERR").message("Ethrow");
  }

  @Get("/api/middleware")
  @Middleware((req, res, next) => {
    res.status(200).send("gotcha").end();
  })
  helloMiddleware(): never {
    throw new Error("It's a proxied request.");
  }

  @Get("/api/middleware2")
  @Middleware(
    (req, res, next) => {
      res
        .status(200)
        .send({ ...res.preparedResponse, world: "hello" })
        .end();
    },
    { priority: MIDDLEWARE_PRIORITY_ACTION_HANDLER + 1 }
  )
  helloMiddlewareAfter(): any {
    return { hello: "world" };
  }
}
