import swaggerJsdoc, { Operation, Options, Parameter, Reference, RequestBody, Responses, Schema, SecurityScheme } from "swagger-jsdoc";
import { Metadata } from "./Decorator";
import { TypescriptSchemaGenerator } from "./TypescriptSwaggerGenerator";
import { ParamOptions, ParamType, SystemParamOptions } from "../router";
import { RouteMetadataArgs, RouteParamMetadataArgs } from "../types/MetadataArgs";
import { ApiPropertyOptions, ApiTagOptions, SwaggerOperationMetadata, SwaggerOptions } from "../types/Swagger";

enum SwaggerParameterType {
  Header = "header",
  Query = "query",
  Path = "path",
  Body = "body",
}

export type RecordSchemaType = { [key: string]: Schema | Reference } | undefined;
export type BaseSchemaType = Schema | Reference;
type ParameterOptionsType = ParamOptions | ApiPropertyOptions | SystemParamOptions;
type AllowedParamType = Exclude<ParamType, "CONTEXT">;

export class SwaggerGenerator {
  private readonly storage = Metadata.getStorage();
  private schemas: RecordSchemaType = {};

  constructor(private options: SwaggerOptions) {}

  public generateSwaggerDocs(): Options {
    this.initializeSchemas();
    const tags = this.getTags();
    const paths = this.getPaths(tags);

    const swaggerOptions: Options = {
      swaggerDefinition: {
        openapi: "3.1.0",
        info: this.options.info,
        tags,
        paths,
        components: {
          schemas: this.schemas,
          securitySchemes: this.getSecuritySchemes(),
        },
      },
      apis: [],
    };

    return swaggerJsdoc(swaggerOptions);
  }

  private initializeSchemas(): void {
    const defaultSchemas = this.options.typesPath ? new TypescriptSchemaGenerator(this.options.typesPath).generateSchema() : {};

    this.schemas = this.generateSwaggerSchemas(defaultSchemas);
  }

  private getTags(): ApiTagOptions[] {
    const uniqueTags = new Set<string>();

    return this.storage.swaggerControllerTags.flatMap(controllerTag =>
      controllerTag.tags.filter(tag => {
        if (!uniqueTags.has(tag.name)) {
          uniqueTags.add(tag.name);
          return true;
        }
        return false;
      })
    );
  }

  private getPaths(tags: ApiTagOptions[]): Record<string, any> {
    return this.storage.routes.reduce((paths, route) => {
      const parsedPath = this.parseRoutePath(route.path);
      const pathItem = this.getPathItem(route, tags);

      paths[parsedPath] = { ...paths[parsedPath], ...pathItem };
      return paths;
    }, {});
  }

  private getPathItem(route: RouteMetadataArgs, tags: ApiTagOptions[]): Record<string, Operation> {
    const operation = this.findSwaggerOperation(route);
    const routeTags = this.getRouteTags(route, tags);

    return {
      [route.action.toLowerCase()]: {
        summary: operation?.options.summary,
        description: operation?.options.description,
        tags: routeTags,
        parameters: this.getSwaggerParameters(route),
        requestBody: this.getSwaggerRequestBody(route),
        responses: this.getSwaggerResponses(route),
        security: [{ Authorization: [] }],
      },
    };
  }

  private findSwaggerOperation(route: RouteMetadataArgs): SwaggerOperationMetadata {
    return this.storage.swaggerOperations.find(op => op.target === route.target && op.method === route.method);
  }

  private getRouteTags(route: RouteMetadataArgs, tags: ApiTagOptions[]): string[] {
    const controllerTag = this.storage.swaggerControllerTags.find(tag => tag.target === route.target);

    if (controllerTag?.tags.length) {
      return controllerTag.tags.map(tag => tag.name);
    }

    const tagName = route.target.name.replace("Controller", "");

    if (!tags.some(tag => tag.name === tagName)) {
      tags.push({ name: tagName, description: `APIs for ${tagName}` });
    }
    return [tagName];
  }

  private parseRoutePath(path: string): string {
    return path
      .replace(/`([^`]+)`/, (_, content) => content)
      .replace(/:([\w]+)(\([^)]+\))?/g, (match, paramName) => (match.endsWith("?") ? `{${paramName}}?` : `{${paramName}}`))
      .replace(/\/+/g, "/")
      .replace(/\/$/, "");
  }

  private getSwaggerParameters(route: RouteMetadataArgs): Parameter[] {
    return this.storage.routeParams
      .filter(param => this.isValidRouteParam(param, route))
      .map(param => this.createParameterObject(param))
      .filter(param => param !== undefined);
  }

  private isValidRouteParam(param: RouteParamMetadataArgs, route: RouteMetadataArgs): boolean {
    return (
      param.target === route.target &&
      param.method === route.method &&
      param.type !== ParamType.Body &&
      param.type !== ParamType.System &&
      param.type !== ParamType.Context &&
      param.name !== "authorization" &&
      param.name !== "user-agent"
    );
  }

  private createParameterObject(param: RouteParamMetadataArgs): Parameter | undefined {
    if (param.type === ParamType.Context) return undefined;
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

  private getParamDescription(options: ParamOptions | SystemParamOptions): string {
    return "delimiter" in options && options.delimiter ? `Delimiter: ${options.delimiter}` : "";
  }

  private isParamRequired(param: RouteParamMetadataArgs): boolean {
    return param.type === ParamType.Path || ("required" in param.options && param.options.required);
  }

  private getParamLocation(paramType: ParamType): SwaggerParameterType {
    const locationMap: Record<AllowedParamType, SwaggerParameterType> = {
      [ParamType.System]: SwaggerParameterType.Header,
      [ParamType.Header]: SwaggerParameterType.Header,
      [ParamType.Query]: SwaggerParameterType.Query,
      [ParamType.Path]: SwaggerParameterType.Path,
      [ParamType.Body]: SwaggerParameterType.Body,
    };

    const location = locationMap[paramType];

    if (!location) {
      throw new Error(`Unknown param type: ${paramType}`);
    }
    return location;
  }

  private getSchemaType(options: ParameterOptionsType): BaseSchemaType | undefined {
    if (options.type === null) return { type: "null" };
    if (options.type === undefined) return { type: "undefined" };

    if (typeof options.type === "object" && options.type !== null) {
      return this.getObjectSchema(options.type);
    }

    if (this.schemas[options.type]) return { $ref: `#/components/schemas/${options.type}` };

    const typeName: string = options.type?.name || options.type?.constructor?.name;

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

  private getObjectSchema(type: object): Schema {
    const schema: Schema = {
      type: "object",
      properties: {},
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

  private isArrayType(typeName: string, options: ParameterOptionsType): boolean {
    return typeName === "Array" || !!("array" in options && options.array) || !!("delimiter" in options && options.delimiter);
  }

  private getArraySchema(options: ParameterOptionsType): Schema | Reference | undefined {
    const itemOptions = { ...options, array: false };

    if ("delimiter" in itemOptions) delete itemOptions.delimiter;

    if (options.type?.name === "Array") itemOptions.type = undefined;

    return {
      type: "array",
      items: this.getSchemaType(itemOptions),
    };
  }

  private getEnumSchema(enumValues: ParameterOptionsType): Schema | Reference | undefined {
    return {
      type: "string",
      enum: Array.isArray(enumValues) ? enumValues : Object.values(enumValues),
    };
  }

  private getComplexTypeSchema(type: any): Schema | Reference | undefined {
    const refSchema = this.storage.swaggerModels.find(model => model.target === type);

    if ("name" in type && refSchema) {
      return { $ref: `#/components/schemas/${type.name}` };
    }

    const schema: Schema = { type: "object" };

    if (typeof type === "function") {
      const instance = new type();

      schema.properties = {};
      for (const key in instance) {
        if (Object.prototype.hasOwnProperty.call(instance, key)) {
          schema.properties[key] = { type: "object" };
        }
      }
    }

    return schema;
  }

  private getPrimitiveTypeSchema(typeName: string, options: ParameterOptionsType): BaseSchemaType {
    const schema: Schema = { type: this.typeMap[typeName]?.type || "object" };

    if (this.typeMap[typeName]?.format) {
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

  private readonly typeMap: Record<string, { type: string; format?: string }> = {
    String: { type: "string" },
    Number: { type: "number" },
    Boolean: { type: "boolean" },
    Date: { type: "string", format: "date-time" },
    BigInt: { type: "integer", format: "int64" },
    Symbol: { type: "string" },
    undefined: { type: "null" },
    null: { type: "null" },
  };

  private getSwaggerRequestBody(route: RouteMetadataArgs): RequestBody | Reference | undefined {
    const bodyParams = this.storage.routeParams.filter(
      param => param.target === route.target && param.method === route.method && param.type === ParamType.Body
    );

    if (bodyParams.length === 0) return undefined;

    const properties: Record<string, BaseSchemaType> = {};
    const required: string[] = [];

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

  private getSwaggerResponses(route: RouteMetadataArgs): Responses | undefined {
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

  private generateSwaggerSchemas(defaultSchemas: RecordSchemaType): RecordSchemaType {
    const schemas = { ...defaultSchemas };

    this.storage.swaggerModels.forEach(model => {
      const properties: Record<string, any> = {};
      const required: string[] = [];

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

  private getPropertySchema(options: ApiPropertyOptions): BaseSchemaType | undefined {
    const schema: BaseSchemaType = this.getSchemaType(options);

    if ("description" in schema && options.description) {
      schema.description = options.description;
    }

    if ("example" in schema && options.example !== undefined) {
      schema.example = options.example;
    }

    return schema;
  }

  private getSecuritySchemes(): Record<string, SecurityScheme> {
    return {
      Authorization: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
      },
    };
  }
}
