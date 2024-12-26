import fs from "fs";
import path from "path";
import { SwaggerPathType } from "./Swagger";
import { RecordSchemaType } from "./SwaggerGenerator";
import { TypescriptSchemaGenerator } from "./TypescriptSwaggerGenerator";

export class DefaultSwaggerSchemaInitializer {
  constructor(private path: SwaggerPathType) {}
  private tsModule: typeof import("typescript") | undefined;

  public initializeSchemas(): RecordSchemaType {
    try {
      if ("schema" in this.path && this.path.schema) {
        return this.loadSchemaFromFile(this.path.schema);
      }

      if ("types" in this.path && this.path.types?.length) {
        return this.generateSchemaFromTypes(this.path.types);
      }

      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during schema initialization";

      throw new Error(`Schema initialization failed: ${errorMessage}`);
    }
  }

  private loadSchemaFromFile(schemaPath: string): RecordSchemaType {
    const resolvedPath = path.resolve(schemaPath);

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

  private generateSchemaFromTypes(typesPath: string[]): RecordSchemaType {
    if (!typesPath.length) {
      throw new Error("Types path array is empty or not defined");
    }

    this.loadTypeScriptModule();

    try {
      const schemaGenerator = new TypescriptSchemaGenerator(this.tsModule, typesPath);

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
}
