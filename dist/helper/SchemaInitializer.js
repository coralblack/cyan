"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultSwaggerSchemaInitializer = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const TypescriptSwaggerGenerator_1 = require("../core/TypescriptSwaggerGenerator");
class DefaultSwaggerSchemaInitializer {
    constructor(options) {
        this.options = options;
    }
    initializeSchemas() {
        var _a;
        try {
            if (this.options.schemaPath) {
                return this.loadSchemaFromFile();
            }
            if ((_a = this.options.typesPath) === null || _a === void 0 ? void 0 : _a.length) {
                return this.generateSchemaFromTypes();
            }
            return {};
        }
        catch (error) {
            this.handleError(error);
            return {};
        }
    }
    loadSchemaFromFile() {
        const resolvedPath = path_1.default.resolve(this.options.schemaPath);
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
    generateSchemaFromTypes() {
        var _a;
        if (!((_a = this.options.typesPath) === null || _a === void 0 ? void 0 : _a.length)) {
            throw new Error("Types path array is empty or not defined");
        }
        this.loadTypeScriptModule();
        try {
            const schemaGenerator = new TypescriptSwaggerGenerator_1.TypescriptSchemaGenerator(this.tsModule, this.options.typesPath);
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
    handleError(error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during schema initialization";
        throw new Error(`Schema initialization failed: ${errorMessage}`);
    }
}
exports.DefaultSwaggerSchemaInitializer = DefaultSwaggerSchemaInitializer;
//# sourceMappingURL=SchemaInitializer.js.map