"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultSwaggerSchemaInitializer = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const TypescriptSwaggerGenerator_1 = require("./TypescriptSwaggerGenerator");
class DefaultSwaggerSchemaInitializer {
    constructor(path) {
        this.path = path;
    }
    initializeSchemas() {
        var _a;
        try {
            if ("schema" in this.path && this.path.schema) {
                return this.loadSchemaFromFile(this.path.schema);
            }
            if ("types" in this.path && ((_a = this.path.types) === null || _a === void 0 ? void 0 : _a.length)) {
                return this.generateSchemaFromTypes(this.path.types);
            }
            return {};
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during schema initialization";
            throw new Error(`Schema initialization failed: ${errorMessage}`);
        }
    }
    loadSchemaFromFile(schemaPath) {
        const resolvedPath = path_1.default.resolve(schemaPath);
        if (!fs_1.default.existsSync(resolvedPath)) {
            throw new Error(`Schema file not found at path: ${resolvedPath}`);
        }
        try {
            const fileContent = fs_1.default.readFileSync(resolvedPath, "utf-8");
            return JSON.parse(fileContent);
        }
        catch (error) {
            throw new Error(`Failed to parse schema file at ${resolvedPath}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    generateSchemaFromTypes(typesPath) {
        if (!typesPath.length) {
            throw new Error("Types path array is empty or not defined");
        }
        this.loadTypeScriptModule();
        try {
            const schemaGenerator = new TypescriptSwaggerGenerator_1.TypescriptSchemaGenerator(this.tsModule, typesPath);
            return schemaGenerator.generateSchema();
        }
        catch (error) {
            throw new Error(`Failed to generate schema from types: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    loadTypeScriptModule() {
        if (!this.tsModule) {
            try {
                this.tsModule = require("typescript");
            }
            catch (e) {
                throw new Error("TypeScript is required to generate schemas from TypeScript files. Please install the required packages: npm install typescript");
            }
        }
    }
}
exports.DefaultSwaggerSchemaInitializer = DefaultSwaggerSchemaInitializer;
//# sourceMappingURL=SchemaInitializer.js.map