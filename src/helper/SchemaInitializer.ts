import fs from "fs";
import path from "path";
import { RecordSchemaType } from "src/core";
import { TypescriptSchemaGenerator } from "../core/TypescriptSwaggerGenerator";

interface SwaggerSchemaOptions {
  schemaPath?: string;
  typesPath?: string[];
}

export class SwaggerSchemaInitializer {
  constructor(private options: SwaggerSchemaOptions) {}
  private tsModule: typeof import("typescript") | undefined;

  public initializeSchemas(): RecordSchemaType {
    try {
      if (this.options.schemaPath) {
        return this.loadSchemaFromFile();
      }

      if (this.options.typesPath?.length) {
        return this.generateSchemaFromTypes();
      }

      return {};
    } catch (error) {
      this.handleError(error);
      return {};
    }
  }

  private loadSchemaFromFile(): RecordSchemaType {
    if (!this.options.schemaPath) {
      throw new Error("Schema path is not defined");
    }

    const resolvedPath = path.resolve(this.options.schemaPath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Schema file not found at path: ${resolvedPath}`);
    }

    try {
      const fileContent = fs.readFileSync(resolvedPath, "utf-8");

      return JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to parse schema file at ${resolvedPath}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private generateSchemaFromTypes(): RecordSchemaType {
    if (!this.options.typesPath?.length) {
      throw new Error("Types path array is empty or not defined");
    }

    this.loadTypeScriptModule();

    try {
      const schemaGenerator = new TypescriptSchemaGenerator(this.tsModule, this.options.typesPath);

      return schemaGenerator.generateSchema();
    } catch (error) {
      throw new Error(`Failed to generate schema from types: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private loadTypeScriptModule() {
    if (!this.tsModule) {
      try {
        this.tsModule = require("typescript");
      } catch (e) {
        throw new Error(
          "TypeScript is required to generate schemas from TypeScript files. Please install the required packages: npm install typescript"
        );
      }
    }
  }

  private handleError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during schema initialization";

    throw new Error(`Schema initialization failed: ${errorMessage}`);
  }
}
