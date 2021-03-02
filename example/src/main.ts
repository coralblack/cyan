import { Cyan } from "@coralblack/cyan/dist/core";
import { ApiController } from "./controller/Api.controller";
import { HelloController } from "./controller/Hello.controller";
import { JsonController } from "./controller/Json.controller";
import { WorldController } from "./controller/World.controller";
import { PageController } from "./controller/Page.controller";
import { AppServer } from "./Server";
import { RepeatTask } from "./task/Repeat.task";

const app = new Cyan({
  name: "Example",
  port: 9090,
  server: AppServer,
  routes: [HelloController, WorldController, JsonController, ApiController, PageController],
  tasks: [RepeatTask],
  options: {
    cors: true,
    bodyParser: true,
    accessLog: true,
  },
});

app.start();
