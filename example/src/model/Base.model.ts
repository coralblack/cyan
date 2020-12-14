import { Model } from "@coralblack/cyan/dist/model";

export class BaseModel extends Model {
  constructor() {
    super({
      host: "127.0.0.1",
      username: "root",
      password: null,
      database: "cyan",
    });
  }
}