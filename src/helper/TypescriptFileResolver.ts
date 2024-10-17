import path from "path";
import { glob } from "glob";
import ts from "typescript";

export class TypeScriptFileResolver {
  constructor(private filePatterns: string[]) {}

  getFilePaths(): string[] {
    let includePatterns: string[] = [];
    const excludePatterns: string[] = [];

    if (typeof this.filePatterns === "string") {
      includePatterns = [this.filePatterns];
    } else {
      this.filePatterns.forEach(pattern => {
        if (pattern.startsWith("!")) {
          excludePatterns.push(pattern.slice(1));
        } else {
          includePatterns.push(pattern);
        }
      });
    }

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

  readTsConfig(): ts.ParsedCommandLine {
    const basePath = process.cwd();
    const configPath = path.join(basePath, "tsconfig.json");
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

    if (configFile.error) {
      throw new Error(`Error reading tsconfig.json: ${configFile.error.messageText}`);
    }

    return ts.parseJsonConfigFileContent(configFile.config, ts.sys, basePath);
  }
}
