"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerGenerator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const SchemaInitializer_1 = require("./SchemaInitializer");
const Decorator_1 = require("../core/Decorator");
const router_1 = require("../router");
var SwaggerParameterType;
(function (SwaggerParameterType) {
    SwaggerParameterType["Header"] = "header";
    SwaggerParameterType["Query"] = "query";
    SwaggerParameterType["Path"] = "path";
    SwaggerParameterType["Body"] = "body";
})(SwaggerParameterType || (SwaggerParameterType = {}));
class SwaggerGenerator {
    constructor(options) {
        this.options = options;
        this.storage = Decorator_1.Metadata.getStorage();
        this.schemas = {};
        this.typeMap = {
            String: { type: "string" },
            Number: { type: "number" },
            Boolean: { type: "boolean" },
            Date: { type: "string", format: "date-time" },
            BigInt: { type: "integer", format: "int64" },
            Symbol: { type: "string" },
            undefined: { type: "null" },
            null: { type: "null" },
        };
    }
    generateSwaggerDocs() {
        var _a;
        this.initializeSchemas();
        const tags = this.getTags();
        const paths = this.getPaths(tags);
        const swaggerOptions = {
            swaggerDefinition: {
                openapi: "3.1.0",
                info: this.options.info,
                servers: this.options.servers,
                tags,
                paths,
                components: {
                    schemas: this.schemas,
                    securitySchemes: this.getSecuritySchemes(),
                },
            },
            apis: [],
        };
        if ((_a = this.options.schemaOutput) === null || _a === void 0 ? void 0 : _a.enabled) {
            this.saveSwaggerJsonSchema();
        }
        return (0, swagger_jsdoc_1.default)(swaggerOptions);
    }
    initializeSchemas() {
        const defaultSchemas = new SchemaInitializer_1.DefaultSwaggerSchemaInitializer({ ...this.options.path }).initializeSchemas();
        this.schemas = this.generateSwaggerSchemas(defaultSchemas);
    }
    getTags() {
        const uniqueTags = new Set();
        return this.storage.swaggerControllerTags.flatMap(controllerTag => controllerTag.tags.filter(tag => {
            if (!uniqueTags.has(tag.name)) {
                uniqueTags.add(tag.name);
                return true;
            }
            return false;
        }));
    }
    getPaths(tags) {
        return this.storage.routes.reduce((paths, route) => {
            const parsedPath = this.parseRoutePath(route.path);
            const pathItem = this.getPathItem(route, tags);
            paths[parsedPath] = { ...paths[parsedPath], ...pathItem };
            return paths;
        }, {});
    }
    getPathItem(route, tags) {
        const operation = this.findSwaggerOperation(route);
        const routeTags = this.getRouteTags(route, tags);
        return {
            [route.action.toLowerCase()]: {
                summary: operation === null || operation === void 0 ? void 0 : operation.options.summary,
                description: operation === null || operation === void 0 ? void 0 : operation.options.description,
                tags: routeTags,
                parameters: this.getSwaggerParameters(route),
                requestBody: this.getSwaggerRequestBody(route),
                responses: this.getSwaggerResponses(route),
                security: [{ Authorization: [] }],
            },
        };
    }
    findSwaggerOperation(route) {
        return this.storage.swaggerOperations.find(op => op.target === route.target && op.method === route.method);
    }
    getRouteTags(route, tags) {
        const controllerTag = this.storage.swaggerControllerTags.find(tag => tag.target === route.target);
        if (controllerTag === null || controllerTag === void 0 ? void 0 : controllerTag.tags.length) {
            return controllerTag.tags.map(tag => tag.name);
        }
        const tagName = route.target.name.replace("Controller", "");
        if (!tags.some(tag => tag.name === tagName)) {
            tags.push({ name: tagName, description: `APIs for ${tagName}` });
        }
        return [tagName];
    }
    parseRoutePath(path) {
        return path
            .replace(/`([^`]+)`/, (_, content) => content)
            .replace(/:([\w]+)(\([^)]+\))?/g, (match, paramName) => (match.endsWith("?") ? `{${paramName}}?` : `{${paramName}}`))
            .replace(/\/+/g, "/")
            .replace(/\/$/, "");
    }
    getSwaggerParameters(route) {
        return this.storage.routeParams.filter(param => this.isValidRouteParam(param, route)).map(param => this.createParameterObject(param));
    }
    isValidRouteParam(param, route) {
        return (param.target === route.target &&
            param.method === route.method &&
            param.type !== router_1.ParamType.Body &&
            param.type !== router_1.ParamType.System &&
            param.name !== "authorization" &&
            param.name !== "user-agent");
    }
    createParameterObject(param) {
        const schema = this.getSchemaType(param.options);
        const description = this.getParamDescription(param.options);
        return {
            name: param.name,
            in: this.getParamLocation(param.type),
            required: this.isParamRequired(param),
            schema,
            description,
        };
    }
    getParamDescription(options) {
        return "delimiter" in options && options.delimiter ? `Delimiter: ${options.delimiter}` : "";
    }
    isParamRequired(param) {
        return param.type === router_1.ParamType.Path || ("required" in param.options && param.options.required);
    }
    getParamLocation(paramType) {
        const locationMap = {
            [router_1.ParamType.System]: SwaggerParameterType.Header,
            [router_1.ParamType.Header]: SwaggerParameterType.Header,
            [router_1.ParamType.Query]: SwaggerParameterType.Query,
            [router_1.ParamType.Path]: SwaggerParameterType.Path,
            [router_1.ParamType.Body]: SwaggerParameterType.Body,
        };
        const location = locationMap[paramType];
        if (!location) {
            throw new Error(`Unknown param type: ${paramType}`);
        }
        return location;
    }
    getSchemaType(options) {
        var _a, _b, _c;
        if (options.type === null)
            return { type: "null" };
        if (options.type === undefined)
            return { type: "undefined" };
        if (typeof options.type === "object" && options.type !== null) {
            return this.getObjectSchema(options.type);
        }
        if (this.schemas[options.type])
            return { $ref: `#/components/schemas/${options.type}` };
        const typeName = ((_a = options.type) === null || _a === void 0 ? void 0 : _a.name) || ((_c = (_b = options.type) === null || _b === void 0 ? void 0 : _b.constructor) === null || _c === void 0 ? void 0 : _c.name);
        if (this.isArrayType(typeName, options)) {
            return this.getArraySchema(options);
        }
        if ("enum" in options && options.enum) {
            return this.getEnumSchema(options.enum);
        }
        if (typeName === "Object" || (!this.typeMap[typeName] && "type" in options)) {
            return this.getComplexTypeSchema(options.type);
        }
        return this.getPrimitiveTypeSchema(typeName, options);
    }
    getObjectSchema(type) {
        const schema = {
            type: "object",
            properties: {},
            description: "",
            example: "",
        };
        for (const [key, value] of Object.entries(type)) {
            schema.properties[key] = this.getSchemaType({ type: value });
        }
        if (Object.keys(schema.properties).length === 0) {
            for (const key in type) {
                if (Object.prototype.hasOwnProperty.call(type, key)) {
                    schema.properties[key] = { type: "object" };
                }
            }
        }
        return schema;
    }
    isArrayType(typeName, options) {
        return typeName === "Array" || !!("array" in options && options.array) || !!("delimiter" in options && options.delimiter);
    }
    getArraySchema(options) {
        var _a;
        const itemOptions = { ...options, array: false };
        if ("delimiter" in itemOptions)
            delete itemOptions.delimiter;
        if (((_a = options.type) === null || _a === void 0 ? void 0 : _a.name) === "Array")
            itemOptions.type = undefined;
        return {
            type: "array",
            items: this.getSchemaType(itemOptions),
        };
    }
    getEnumSchema(enumValues) {
        return {
            type: "string",
            enum: Array.isArray(enumValues) ? enumValues : Object.values(enumValues),
        };
    }
    getComplexTypeSchema(type) {
        const refSchema = this.storage.swaggerModels.find(model => model.target === type);
        if ("name" in type && refSchema) {
            return { $ref: `#/components/schemas/${type.name}` };
        }
        const schema = { type: "object" };
        if (typeof type === "function") {
            schema.properties = {};
            const instance = new type();
            for (const key of Object.getOwnPropertyNames(instance)) {
                if (Reflect && Reflect.getMetadata) {
                    const propertyType = Reflect.getMetadata("design:type", type.prototype, key);
                    if (propertyType) {
                        schema.properties[key] = this.getSchemaType({ type: propertyType });
                    }
                }
            }
        }
        return schema;
    }
    getPrimitiveTypeSchema(typeName, options) {
        var _a, _b;
        const schema = { type: ((_a = this.typeMap[typeName]) === null || _a === void 0 ? void 0 : _a.type) || "object" };
        if ((_b = this.typeMap[typeName]) === null || _b === void 0 ? void 0 : _b.format) {
            schema.format = this.typeMap[typeName].format;
        }
        if ("description" in options && options.description) {
            schema.description = options.description;
        }
        if ("example" in options && options.example !== undefined) {
            schema.example = options.example;
        }
        if (typeName === "BigInt") {
            schema.description = schema.description ? schema.description + " " : "";
        }
        return schema;
    }
    getSwaggerRequestBody(route) {
        const bodyParams = this.storage.routeParams.filter(param => param.target === route.target && param.method === route.method && param.type === router_1.ParamType.Body);
        if (bodyParams.length === 0)
            return undefined;
        const properties = {};
        const required = [];
        bodyParams.forEach(param => {
            const schema = this.getSchemaType(param.options);
            properties[param.name] = schema;
            if ("required" in param.options && param.options.required) {
                required.push(param.name);
            }
        });
        return {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties,
                        required: required.length > 0 ? required : undefined,
                    },
                },
            },
        };
    }
    getSwaggerResponses(route) {
        const responses = this.storage.swaggerResponses
            .filter(resp => resp.target === route.target && resp.method === route.method)
            .reduce((acc, resp) => {
            acc[resp.statusCode] = {
                description: resp.options.description || "Response description",
                content: {
                    "application/json": {
                        schema: this.getSchemaType(resp.options),
                    },
                },
            };
            return acc;
        }, {});
        if (Object.keys(responses).length === 0) {
            responses["200"] = {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                        },
                    },
                },
            };
        }
        return responses;
    }
    generateSwaggerSchemas(defaultSchemas) {
        const schemas = { ...defaultSchemas };
        this.storage.swaggerModels.forEach(model => {
            const properties = {};
            const required = [];
            this.storage.swaggerProperties
                .filter(prop => prop.target === model.target)
                .forEach(prop => {
                properties[prop.propertyKey] = this.getPropertySchema(prop.options);
                if (prop.options.required) {
                    required.push(prop.propertyKey);
                }
            });
            schemas[model.target.name] = {
                type: "object",
                properties,
                required: required.length > 0 ? required : undefined,
                description: model.options.description,
            };
        });
        return schemas;
    }
    getPropertySchema(options) {
        const schema = this.getSchemaType(options);
        if ("description" in schema && options.description) {
            schema.description = options.description;
        }
        if ("example" in schema && options.example !== undefined) {
            schema.example = options.example;
        }
        return schema;
    }
    getSecuritySchemes() {
        return {
            Authorization: {
                type: "apiKey",
                in: "header",
                name: "Authorization",
            },
        };
    }
    saveSwaggerJsonSchema() {
        try {
            const outputPath = this.options.schemaOutput.outputPath;
            const fileName = this.options.schemaOutput.fileName || "swagger-schema.json";
            const finalFileName = fileName.endsWith(".json") ? fileName : `${fileName}.json`;
            const fullPath = path.join(outputPath, finalFileName);
            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true });
            }
            const jsonContent = JSON.stringify(this.schemas, null, 2);
            fs.writeFileSync(fullPath, jsonContent, "utf8");
        }
        catch (error) {
            throw new Error("Error generating Swagger JSON schema");
        }
    }
}
exports.SwaggerGenerator = SwaggerGenerator;
//# sourceMappingURL=SwaggerGenerator.js.map