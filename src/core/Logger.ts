/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */

import { datetime } from "../util";

export class Logger {
  public appName = "App";

  public static _instance: Logger | null = null;

  static getInstance(): Logger {
    if (Logger._instance) return Logger._instance;

    Logger._instance = new Logger();
    return Logger._instance;
  }

  static setInstance(logger: Logger): void {
    Logger._instance = logger;
  }

  log(...args: any[]): void {
    console.log(datetime(","), `${this.appName} [LOG]`, ...args);
  }

  debug(...args: any[]): void {
    console.debug(datetime(","), `${this.appName} [DEBUG]`, ...args);
  }

  warn(...args: any[]): void {
    console.warn(datetime(","), `${this.appName} [WARN]`, ...args);
  }

  error(...args: any[]): void {
    console.error(datetime(","), `${this.appName} [ERROR]`, ...args);
  }

  info(...args: any[]): void {
    console.info(datetime(","), `${this.appName} [INFO]`, ...args);
  }
}
