import type {
  BaseType,
  InterfaceType,
  IntersectionType,
  ObjectType,
  SourceFile,
  Symbol,
  Type,
  TypeChecker,
  TypeReference,
  UnionType,
} from "typescript";
import { BaseSchemaType, RecordSchemaType } from "./SwaggerGenerator";
import { TypeScriptFileResolver } from "../helper/TypescriptFileResolver";

export class TypescriptSchemaGenerator {
  constructor(private ts: typeof import("typescript"), private filePatterns: string[]) {}

  private typeChecker: TypeChecker;
  private schemas: RecordSchemaType = {};
  private maxDepth = 5;

  public generateSchema(): RecordSchemaType {
    const fileResolver = new TypeScriptFileResolver(this.ts, this.filePatterns);
    const filePaths = fileResolver.getFilePaths();

    const tsconfig = fileResolver.readTsConfig();

    const program = this.ts.createProgram(filePaths, tsconfig.options);

    this.typeChecker = program.getTypeChecker();

    filePaths.forEach(filePath => {
      const sourceFile = program.getSourceFile(filePath);

      if (sourceFile) {
        this.extractTypes(sourceFile);
      }
    });

    return this.schemas;
  }

  private extractTypes(sourceFile: SourceFile): void {
    this.ts.forEachChild(sourceFile, node => {
      if (this.ts.isInterfaceDeclaration(node) || this.ts.isClassDeclaration(node) || this.ts.isTypeAliasDeclaration(node)) {
        const symbol = this.typeChecker.getSymbolAtLocation(node.name);

        if (symbol) {
          const type = this.typeChecker.getDeclaredTypeOfSymbol(symbol);
          const name = symbol.getName();

          if (!this.schemas[name]) {
            this.schemas[name] = this.getTypeDefinition(type);
          }
        }
      }
    });
  }

  getTypeDefinition(type: Type, depth = 0): BaseSchemaType {
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

    let result: BaseSchemaType;
    let shouldAddToSchemas = false;

    if (this.isEnumType(type)) {
      result = this.getEnumType(type);
    } else if (this.isUnionType(type, typeName)) {
      result = this.getUnionType(type, depth);
    } else if (type.isIntersection()) {
      result = this.getIntersectionType(type, depth);
    } else if (this.isDateType(type)) {
      result = { type: "string", format: "date-time" };
      shouldAddToSchemas = true;
    } else if (type.isClassOrInterface()) {
      result = this.getObjectType(type, depth);
    } else if (this.isArrayType(type)) {
      result = this.getArrayType(type, depth);
      shouldAddToSchemas = true;
    } else if (this.isAnonymousObjectType(type)) {
      result = this.getAnonymousObjectType(type, depth);
      shouldAddToSchemas = true;
    } else {
      result = this.getPrimitiveType(type);
      shouldAddToSchemas = true;
    }

    if (!shouldAddToSchemas) this.schemas[typeName] = result;

    const description = this.getJsDocDescription(type);
    const example = this.getJsDocExample(type);

    return {
      ...result,
      ...(description ? { description } : {}),
      ...(example ? { example: example } : {}),
    };
  }

  private getUnionType(type: UnionType, depth: number): BaseSchemaType {
    return {
      oneOf: type.types.map(t => this.getTypeDefinition(t, depth + 1)),
    };
  }

  private getIntersectionType(type: IntersectionType, depth: number): BaseSchemaType {
    return {
      allOf: type.types.map(t => this.getTypeDefinition(t, depth + 1)),
    };
  }

  private getObjectType(type: InterfaceType | BaseType, depth: number): BaseSchemaType {
    const properties = {};
    const required = [];

    this.processProperties(type.getProperties(), properties, required, depth);

    type.getBaseTypes()?.forEach(baseType => {
      this.processProperties(baseType.getProperties(), properties, required, depth);
    });

    if (type.symbol && type.symbol.flags & this.ts.SymbolFlags.Class && type.symbol.exports) {
      type.symbol.exports.forEach((member, key) => {
        if (member.flags & this.ts.SymbolFlags.Property && key !== "prototype") {
          const memberType = this.typeChecker.getTypeOfSymbolAtLocation(member, member.valueDeclaration);
          const memberName = key.toString();

          let memberValue;

          if (member.valueDeclaration && this.ts.isPropertyDeclaration(member.valueDeclaration)) {
            const initializer = member.valueDeclaration.initializer;

            if (initializer) {
              if (this.ts.isNumericLiteral(initializer)) {
                memberValue = Number(initializer.text);
              } else if (this.ts.isStringLiteral(initializer)) {
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

  private processProperties(props: Symbol[], properties: BaseSchemaType, required: string[], depth: number): void {
    props.forEach(prop => {
      if (prop.name !== "prototype") {
        const propType = this.typeChecker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration);
        const propName = prop.getName();

        properties[propName] = this.getTypeDefinition(propType, depth + 1);
        const isOptional = prop.getFlags() & this.ts.SymbolFlags.Optional;

        if (!isOptional && !(propType.getFlags() & this.ts.TypeFlags.Undefined)) {
          required.push(propName);
        }
      }
    });
  }

  private getAnonymousObjectType(type: Type, depth: number): BaseSchemaType {
    const properties = {};
    const required = [];

    type.getProperties().forEach(prop => {
      const propType = this.typeChecker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration);
      const propName = prop.getName();
      const propDeclaration = prop.valueDeclaration;

      properties[propName] = this.getTypeDefinition(propType, depth + 1);

      if (propDeclaration && this.ts.isPropertySignature(propDeclaration)) {
        if (!propDeclaration.questionToken && !(propType.getFlags() & this.ts.TypeFlags.Undefined)) {
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

  private getArrayType(type: Type, depth: number): BaseSchemaType {
    const elementType = (type as TypeReference).typeArguments?.[0];

    return {
      type: "array",
      items: elementType ? this.getTypeDefinition(elementType, depth + 1) : {},
    };
  }

  private getPrimitiveType(type: Type): BaseSchemaType {
    if (type.flags & this.ts.TypeFlags.String) return { type: "string" };
    if (type.flags & this.ts.TypeFlags.Number) return { type: "number" };
    if (type.flags & this.ts.TypeFlags.Boolean) return { type: "boolean" };
    if (type.flags & this.ts.TypeFlags.Null) return { type: "null" };
    if (type.flags & this.ts.TypeFlags.Undefined) return { type: "undefined" };
    if (type.flags & this.ts.TypeFlags.BigInt) return { type: "integer", format: "int64" };
    if (type.symbol && type.symbol.name === "Date") return { type: "string", format: "date-time" };

    if (type.symbol && type.symbol.name) {
      const name = type.symbol.name;

      if (name === "String" || name === "Number" || name === "Boolean") {
        return { type: name.toLowerCase() };
      }

      return { $ref: `#/components/schemas/${name}` };
    }

    return { type: "object" };
  }

  private getEnumType(type: Type): BaseSchemaType {
    const enumValues: (string | number)[] = [];

    if (type.symbol && type.symbol.valueDeclaration && this.ts.isEnumDeclaration(type.symbol.valueDeclaration)) {
      const enumDeclaration = type.symbol.valueDeclaration;

      for (const member of enumDeclaration.members) {
        const memberSymbol = this.typeChecker.getSymbolAtLocation(member.name);

        if (memberSymbol) {
          const constantValue = this.typeChecker.getConstantValue(member);

          if (constantValue !== undefined) {
            enumValues.push(constantValue);
          } else {
            const memberType = this.typeChecker.getTypeOfSymbolAtLocation(memberSymbol, member);

            if (memberType.isLiteral() && memberType.isStringLiteral()) {
              enumValues.push(memberType.value);
            }
          }
        }
      }
    }

    let defaultValue: string | number | undefined;

    if (this.isEnumMemberType(type) && type.symbol) {
      const enumMemberDeclaration = type.symbol.declarations?.[0];

      if (enumMemberDeclaration && this.ts.isEnumMember(enumMemberDeclaration)) {
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

  private getJsDocDescription(type: Type): string | undefined {
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

  private getJsDocExample(type: Type): string | undefined {
    const symbol = type.getSymbol();

    if (symbol) {
      const jsDocTags = symbol.getJsDocTags();
      const exampleTag = jsDocTags.find(tag => tag.name === "example");

      if (exampleTag) {
        return exampleTag.text ? exampleTag.text[0]?.text : undefined;
      }
    }
    return undefined;
  }

  private isGenericType(type: Type): boolean {
    return !!(type.flags & this.ts.TypeFlags.TypeParameter);
  }

  private isAnonymousObjectType(type: Type): boolean {
    return !!((type.flags & this.ts.TypeFlags.Object) !== 0 && (type as ObjectType).objectFlags & this.ts.ObjectFlags.Anonymous);
  }

  private isEnumType(type: Type): boolean {
    return !!(type.flags & this.ts.TypeFlags.Enum) || !!(type.flags & this.ts.TypeFlags.EnumLiteral) || this.isEnumMemberType(type);
  }

  private isEnumMemberType(type: Type): boolean {
    return !!(type.flags & this.ts.TypeFlags.EnumLiteral) && !!(type.symbol && type.symbol.flags & this.ts.SymbolFlags.EnumMember);
  }

  private isUnionType(type: Type, name: string): type is UnionType {
    return name !== "boolean" && type.isUnion();
  }

  private isDateType(type: Type): boolean {
    return type.symbol && type.symbol.name === "Date";
  }

  private isArrayType(type: Type): boolean {
    return type.getSymbol()?.getName() === "Array";
  }
}
