import { Cyan } from "cyan/dist/core";
import { HelloController } from "./controller/Hello.controller";
import { JsonController } from "./controller/Json.controller";
import { WorldController } from "./controller/World.controller";
import { AppServer } from "./Server";

const app = new Cyan({
  name: "Example",
  port: 9090,
  server: AppServer,
  routes: [HelloController, WorldController, JsonController],
  options: {
    cors: true,
    bodyParser: true,
    accessLog: true,
  },
});

app.start();
