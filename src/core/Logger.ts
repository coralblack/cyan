/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */

import { datetime } from "../util";

export class Logger {
  static getInstance(): Logger {
    return new Logger();
  }

  debug(...args: any[]): void {
    console.debug(datetime(","), ...args);
  }

  warn(...args: any[]): void {
    console.warn(datetime(","), ...args);
  }

  error(...args: any[]): void {
    console.error(datetime(","), ...args);
  }

  info(...args: any[]): void {
    console.info(datetime(","), ...args);
  }
}
