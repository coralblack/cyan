"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptFileResolver = void 0;
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
class TypeScriptFileResolver {
    constructor(ts, filePatterns) {
        this.ts = ts;
        this.filePatterns = filePatterns;
    }
    getFilePaths() {
        let includePatterns = [];
        const excludePatterns = [];
        if (typeof this.filePatterns === "string") {
            includePatterns = [this.filePatterns];
        }
        else {
            this.filePatterns.forEach(pattern => {
                if (pattern.startsWith("!")) {
                    excludePatterns.push(pattern.slice(1));
                }
                else {
                    includePatterns.push(pattern);
                }
            });
        }
        let filePaths = [];
        includePatterns.forEach(pattern => {
            const matchedPaths = glob_1.glob.sync(pattern);
            filePaths = filePaths.concat(matchedPaths);
        });
        if (excludePatterns.length > 0) {
            excludePatterns.forEach(pattern => {
                const excludedPaths = glob_1.glob.sync(pattern);
                filePaths = filePaths.filter(file => !excludedPaths.includes(file));
            });
        }
        return filePaths;
    }
    readTsConfig() {
        if (!this.ts) {
            throw new Error("TypeScriptFileResolver not initialized. Call initialize() first.");
        }
        const basePath = process.cwd();
        const configPath = path_1.default.join(basePath, "tsconfig.json");
        const configFile = this.ts.readConfigFile(configPath, this.ts.sys.readFile);
        if (configFile.error) {
            throw new Error(`Error reading tsconfig.json: ${configFile.error.messageText}`);
        }
        return this.ts.parseJsonConfigFileContent(configFile.config, this.ts.sys, basePath);
    }
}
exports.TypeScriptFileResolver = TypeScriptFileResolver;
//# sourceMappingURL=TypescriptFileResolver.js.map