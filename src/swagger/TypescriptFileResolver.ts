import path from "path";
import { glob } from "glob";
import type { ParsedCommandLine } from "typescript";

export class TypeScriptFileResolver {
  constructor(private ts: typeof import("typescript"), public readonly filePatterns: string[]) {}

  getFilePaths(): string[] {
    const includePatterns: string[] = [];
    const excludePatterns: string[] = [];

    this.filePatterns.forEach(pattern => {
      if (pattern.startsWith("!")) {
        excludePatterns.push(pattern.slice(1));
      } else {
        includePatterns.push(pattern);
      }
    });

    let filePaths: string[] = [];

    includePatterns.forEach(pattern => {
      const matchedPaths = glob.sync(pattern);

      filePaths = filePaths.concat(matchedPaths);
    });

    if (excludePatterns.length > 0) {
      excludePatterns.forEach(pattern => {
        const excludedPaths = glob.sync(pattern);

        filePaths = filePaths.filter(file => !excludedPaths.includes(file));
      });
    }

    return filePaths;
  }

  readTsConfig(): ParsedCommandLine {
    if (!this.ts) {
      throw new Error("TypeScriptFileResolver not initialized. Call initialize() first.");
    }

    const basePath = process.cwd();
    const configPath = path.join(basePath, "tsconfig.json");
    const configFile = this.ts.readConfigFile(configPath, this.ts.sys.readFile);

    if (configFile.error) {
      throw new Error(`Error reading tsconfig.json: ${configFile.error.messageText}`);
    }

    return this.ts.parseJsonConfigFileContent(configFile.config, this.ts.sys, basePath);
  }
}
