/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */

import { datetime } from "../util";

export class Logger {
  public appName = "App";

  public static _instance: Logger = null;
  static getInstance(): Logger {
    if (Logger._instance) return Logger._instance;

    Logger._instance = new Logger();
    return Logger._instance;
  }

  debug(...args: any[]): void {
    console.debug(datetime(","), `${this.appName},`, ...args);
  }

  warn(...args: any[]): void {
    console.warn(datetime(","), `${this.appName},`, ...args);
  }

  error(...args: any[]): void {
    console.error(datetime(","), `${this.appName},`, ...args);
  }

  info(...args: any[]): void {
    console.info(datetime(","), `${this.appName},`, ...args);
  }
}
