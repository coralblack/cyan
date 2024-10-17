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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypescriptSchemaGenerator = void 0;
const ts = __importStar(require("typescript"));
const TypescriptFileResolver_1 = require("../helper/TypescriptFileResolver");
class TypeDefinitionGenerator {
    constructor(typeChecker, schemas = {}) {
        this.typeChecker = typeChecker;
        this.schemas = schemas;
        this.maxDepth = 5;
    }
    getTypeDefinition(type, depth = 0) {
        const typeName = this.typeChecker.typeToString(type);
        if (depth > this.maxDepth) {
            return { type: "object" };
        }
        if (this.schemas[typeName]) {
            return { $ref: `#/components/schemas/${typeName}` };
        }
        if (this.isGenericType(type)) {
            return { type: "object", description: `Generic type: ${typeName}` };
        }
        let result;
        let shouldAddToSchemas = false;
        if (this.isEnumType(type)) {
            result = this.getEnumType(type);
        }
        else if (this.isUnionType(type, typeName)) {
            result = this.getUnionType(type, depth);
        }
        else if (type.isIntersection()) {
            result = this.getIntersectionType(type, depth);
        }
        else if (this.isDateType(type)) {
            result = { type: "string", format: "date-time" };
            shouldAddToSchemas = true;
        }
        else if (type.isClassOrInterface()) {
            result = this.getObjectType(type, depth);
        }
        else if (this.isArrayType(type)) {
            result = this.getArrayType(type, depth);
            shouldAddToSchemas = true;
        }
        else if (this.isAnonymousObjectType(type)) {
            result = this.getAnonymousObjectType(type, depth);
            shouldAddToSchemas = true;
        }
        else {
            result = this.getPrimitiveType(type);
            shouldAddToSchemas = true;
        }
        if (!shouldAddToSchemas)
            this.schemas[typeName] = result;
        const description = this.getJsDocDescription(type);
        const example = this.getJsDocExample(type);
        return {
            ...result,
            ...(description ? { description } : {}),
            ...(example ? { example: example } : {}),
        };
    }
    getUnionType(type, depth) {
        return {
            oneOf: type.types.map(t => this.getTypeDefinition(t, depth + 1)),
        };
    }
    getIntersectionType(type, depth) {
        return {
            allOf: type.types.map(t => this.getTypeDefinition(t, depth + 1)),
        };
    }
    getObjectType(type, depth) {
        var _a;
        const properties = {};
        const required = [];
        this.processProperties(type.getProperties(), properties, required, depth);
        (_a = type.getBaseTypes()) === null || _a === void 0 ? void 0 : _a.forEach(baseType => {
            this.processProperties(baseType.getProperties(), properties, required, depth);
        });
        if (type.symbol && type.symbol.flags & ts.SymbolFlags.Class && type.symbol.exports) {
            type.symbol.exports.forEach((member, key) => {
                if (member.flags & ts.SymbolFlags.Property && key !== "prototype") {
                    const memberType = this.typeChecker.getTypeOfSymbolAtLocation(member, member.valueDeclaration);
                    const memberName = key.toString();
                    let memberValue;
                    if (member.valueDeclaration && ts.isPropertyDeclaration(member.valueDeclaration)) {
                        const initializer = member.valueDeclaration.initializer;
                        if (initializer) {
                            if (ts.isNumericLiteral(initializer)) {
                                memberValue = Number(initializer.text);
                            }
                            else if (ts.isStringLiteral(initializer)) {
                                memberValue = initializer.text;
                            }
                        }
                    }
                    properties[memberName] =
                        memberValue !== undefined ? { type: typeof memberValue, const: memberValue } : this.getTypeDefinition(memberType, depth + 1);
                }
            });
        }
        const description = this.getJsDocDescription(type);
        const example = this.getJsDocExample(type);
        return {
            type: "object",
            properties,
            required: required.length > 0 ? required : undefined,
            description,
            example,
        };
    }
    processProperties(props, properties, required, depth) {
        props.forEach(prop => {
            if (prop.name !== "prototype") {
                const propType = this.typeChecker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration);
                const propName = prop.getName();
                properties[propName] = this.getTypeDefinition(propType, depth + 1);
                const isOptional = prop.getFlags() & ts.SymbolFlags.Optional;
                if (!isOptional && !(propType.getFlags() & ts.TypeFlags.Undefined)) {
                    required.push(propName);
                }
            }
        });
    }
    getAnonymousObjectType(type, depth) {
        const properties = {};
        const required = [];
        type.getProperties().forEach(prop => {
            const propType = this.typeChecker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration);
            const propName = prop.getName();
            const propDeclaration = prop.valueDeclaration;
            properties[propName] = this.getTypeDefinition(propType, depth + 1);
            if (propDeclaration && ts.isPropertySignature(propDeclaration)) {
                if (!propDeclaration.questionToken && !(propType.getFlags() & ts.TypeFlags.Undefined)) {
                    required.push(propName);
                }
            }
        });
        return {
            type: "object",
            properties,
            required: required.length > 0 ? required : undefined,
        };
    }
    getArrayType(type, depth) {
        var _a;
        const elementType = (_a = type.typeArguments) === null || _a === void 0 ? void 0 : _a[0];
        return {
            type: "array",
            items: elementType ? this.getTypeDefinition(elementType, depth + 1) : {},
        };
    }
    getPrimitiveType(type) {
        if (type.flags & ts.TypeFlags.String)
            return { type: "string" };
        if (type.flags & ts.TypeFlags.Number)
            return { type: "number" };
        if (type.flags & ts.TypeFlags.Boolean)
            return { type: "boolean" };
        if (type.flags & ts.TypeFlags.Null)
            return { type: "null" };
        if (type.flags & ts.TypeFlags.Undefined)
            return { type: "undefined" };
        if (type.flags & ts.TypeFlags.BigInt)
            return { type: "integer", format: "int64" };
        if (type.symbol && type.symbol.name === "Date")
            return { type: "string", format: "date-time" };
        if (type.symbol && type.symbol.name) {
            const name = type.symbol.name;
            if (name === "String" || name === "Number" || name === "Boolean") {
                return { type: name.toLowerCase() };
            }
            return { $ref: `#/components/schemas/${name}` };
        }
        return { type: "object" };
    }
    getEnumType(type) {
        var _a;
        const enumValues = [];
        if (type.symbol && type.symbol.valueDeclaration && ts.isEnumDeclaration(type.symbol.valueDeclaration)) {
            const enumDeclaration = type.symbol.valueDeclaration;
            for (const member of enumDeclaration.members) {
                const memberSymbol = this.typeChecker.getSymbolAtLocation(member.name);
                if (memberSymbol) {
                    const constantValue = this.typeChecker.getConstantValue(member);
                    if (constantValue !== undefined) {
                        enumValues.push(constantValue);
                    }
                    else {
                        const memberType = this.typeChecker.getTypeOfSymbolAtLocation(memberSymbol, member);
                        if (memberType.isLiteral() && memberType.isStringLiteral()) {
                            enumValues.push(memberType.value);
                        }
                    }
                }
            }
        }
        let defaultValue;
        if (this.isEnumMemberType(type) && type.symbol) {
            const enumMemberDeclaration = (_a = type.symbol.declarations) === null || _a === void 0 ? void 0 : _a[0];
            if (enumMemberDeclaration && ts.isEnumMember(enumMemberDeclaration)) {
                defaultValue = this.typeChecker.getConstantValue(enumMemberDeclaration);
            }
        }
        const description = this.getJsDocDescription(type);
        const example = this.getJsDocExample(type);
        return {
            type: "string",
            enum: enumValues,
            ...(defaultValue !== undefined && { default: defaultValue }),
            example,
            description,
        };
    }
    getJsDocDescription(type) {
        const symbol = type.getSymbol();
        if (symbol) {
            const jsDocTags = symbol.getJsDocTags();
            const descriptionTag = jsDocTags.find(tag => tag.name === "description");
            if (descriptionTag && descriptionTag.text) {
                return descriptionTag.text.map(t => t.text).join("\n");
            }
        }
        return undefined;
    }
    getJsDocExample(type) {
        var _a;
        const symbol = type.getSymbol();
        if (symbol) {
            const jsDocTags = symbol.getJsDocTags();
            const exampleTag = jsDocTags.find(tag => tag.name === "example");
            if (exampleTag) {
                return exampleTag.text ? (_a = exampleTag.text[0]) === null || _a === void 0 ? void 0 : _a.text : undefined;
            }
        }
        return undefined;
    }
    isGenericType(type) {
        return !!(type.flags & ts.TypeFlags.TypeParameter);
    }
    isAnonymousObjectType(type) {
        return !!((type.flags & ts.TypeFlags.Object) !== 0 && type.objectFlags & ts.ObjectFlags.Anonymous);
    }
    isEnumType(type) {
        return !!(type.flags & ts.TypeFlags.Enum) || !!(type.flags & ts.TypeFlags.EnumLiteral) || this.isEnumMemberType(type);
    }
    isEnumMemberType(type) {
        return !!(type.flags & ts.TypeFlags.EnumLiteral) && !!(type.symbol && type.symbol.flags & ts.SymbolFlags.EnumMember);
    }
    isUnionType(type, name) {
        return name !== "boolean" && type.isUnion();
    }
    isDateType(type) {
        return type.symbol && type.symbol.name === "Date";
    }
    isArrayType(type) {
        var _a;
        return ((_a = type.getSymbol()) === null || _a === void 0 ? void 0 : _a.getName()) === "Array";
    }
}
class TypescriptSchemaGenerator {
    constructor(filePatterns) {
        this.filePatterns = filePatterns;
        this.schemas = {};
    }
    generateSchema() {
        const fileResolver = new TypescriptFileResolver_1.TypeScriptFileResolver(this.filePatterns);
        const filePaths = fileResolver.getFilePaths();
        const tsconfig = fileResolver.readTsConfig();
        const program = ts.createProgram(filePaths, tsconfig.options);
        this.typeChecker = program.getTypeChecker();
        const typeDefinitionGenerator = new TypeDefinitionGenerator(this.typeChecker, this.schemas);
        filePaths.forEach(filePath => {
            const sourceFile = program.getSourceFile(filePath);
            if (sourceFile) {
                this.extractTypes(sourceFile, typeDefinitionGenerator);
            }
        });
        return this.schemas;
    }
    extractTypes(sourceFile, typeDefinitionGenerator) {
        ts.forEachChild(sourceFile, node => {
            if (ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
                const symbol = this.typeChecker.getSymbolAtLocation(node.name);
                if (symbol) {
                    const type = this.typeChecker.getDeclaredTypeOfSymbol(symbol);
                    const name = symbol.getName();
                    if (!this.schemas[name]) {
                        this.schemas[name] = typeDefinitionGenerator.getTypeDefinition(type);
                    }
                }
            }
        });
    }
}
exports.TypescriptSchemaGenerator = TypescriptSchemaGenerator;
//# sourceMappingURL=TypescriptSwaggerGenerator.js.map