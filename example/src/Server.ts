import { Server } from "cyan/dist/core";
import { datetime } from "cyan/dist/util";
import morgan from "morgan";

export class AppServer extends Server {
  beforeInitRoutes(): void {
    this.getServer().use(
      morgan((tokens, req, res): any =>
        [
          `${datetime(",")}`,
          this.cyan.settings.name,
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, "content-length"),
          "-",
          tokens["response-time"](req, res),
          "ms",
        ].join(" ")
      )
    );
  }
}
