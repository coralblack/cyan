import { Cyan, Stage } from "@coralblack/cyan/dist/core";
import { ApiController } from "./controller/Api.controller";
import { HelloController } from "./controller/Hello.controller";
import { JsonController } from "./controller/Json.controller";
import { WorldController } from "./controller/World.controller";
import { AppServer } from "./Server";
import { RepeatTask } from "./task/Repeat.task";
import { SwaggerController } from "./controller/Swagger.controller";

const app = new Cyan({
  name: "Example",
  port: 9090,
  server: AppServer,
  routes: [HelloController, WorldController, JsonController, ApiController, SwaggerController],
  tasks: [RepeatTask],
  swagger: {
    targetEnvs: [Stage.Local],
    servers: [{ url: "http://localhost:9090" }],
    path: { types: ["./src/types/**/*.ts", "!**/*.url.ts", "!**/*.rest.ts", "!**/*.flax.ts"] },
    info: {
      title: "Example API",
      version: "1.0.0",
      description: "Example API Description",
      contact: {
        name: "JNPMEDI",
        email: "foo@jnpmedi.com",
      },
    },
  },
  options: {
    cors: true,
    bodyParser: true,
    accessLog: true,
  },
});

app.start();
