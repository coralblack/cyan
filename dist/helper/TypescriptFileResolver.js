"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptFileResolver = void 0;
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
const typescript_1 = __importDefault(require("typescript"));
class TypeScriptFileResolver {
    constructor(filePatterns) {
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
        const basePath = process.cwd();
        const configPath = path_1.default.join(basePath, "tsconfig.json");
        const configFile = typescript_1.default.readConfigFile(configPath, typescript_1.default.sys.readFile);
        if (configFile.error) {
            throw new Error(`Error reading tsconfig.json: ${configFile.error.messageText}`);
        }
        return typescript_1.default.parseJsonConfigFileContent(configFile.config, typescript_1.default.sys, basePath);
    }
}
exports.TypeScriptFileResolver = TypeScriptFileResolver;
//# sourceMappingURL=TypescriptFileResolver.js.map