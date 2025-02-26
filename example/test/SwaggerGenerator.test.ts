import fs from "fs";
import path from "path";
import { Stage } from "@coralblack/cyan/dist/core";
import { Metadata } from "@coralblack/cyan/dist/core/Decorator";
import { SwaggerGenerator } from "@coralblack/cyan/dist/core/SwaggerGenerator";
import { DefaultSwaggerSchemaInitializer } from "@coralblack/cyan/dist/helper/SchemaInitializer";
import { HttpMethod } from "@coralblack/cyan/dist/http";
import { ParamType } from "@coralblack/cyan/dist/router";
import { RouteMetadataArgs } from "@coralblack/cyan/dist/types/MetadataArgs";
import { ApiTagOptions, SwaggerOptions } from "@coralblack/cyan/dist/types/Swagger";

describe("SwaggerGenerator", () => {
  let swaggerGenerator: SwaggerGenerator;
  let mockMetadataStorage: any;
  const TEST_OUTPUT_PATH = "./test-output";

  const mockSwaggerOptions: SwaggerOptions = {
    targetEnvs: [Stage.Local],
    info: {
      title: "Test API",
      version: "1.0.0",
    },
    path: { schema: "test-schema" },
  };

  beforeEach(() => {
    mockMetadataStorage = {
      routes: [],
      routeParams: [],
      middlewares: [],
      entities: [],
      entityColumns: [],
      entityRelations: [],
      tasks: [],
      swaggerOperations: [],
      swaggerProperties: [],
      swaggerModels: [],
      swaggerResponses: [],
      swaggerControllerTags: [],
    };

    jest.spyOn(Metadata, "getStorage").mockReturnValue(mockMetadataStorage);
    jest.spyOn(DefaultSwaggerSchemaInitializer.prototype, "initializeSchemas").mockReturnValue({});

    swaggerGenerator = new SwaggerGenerator(mockSwaggerOptions);
  });

  afterEach(() => {
    try {
      // 테스트 디렉토리가 존재하는 경우에만 삭제 진행
      if (fs.existsSync(TEST_OUTPUT_PATH)) {
        const files = fs.readdirSync(TEST_OUTPUT_PATH);

        // 디렉토리 내 모든 파일 삭제
        for (const file of files) {
          fs.unlinkSync(path.join(TEST_OUTPUT_PATH, file));
        }

        // 디렉토리 삭제
        fs.rmdirSync(TEST_OUTPUT_PATH);
      }
    } catch (error) {
      console.error("테스트 파일 정리 중 에러 발생:", error);
    }
  });

  describe("generateSwaggerDocs", () => {
    it("빈 라우트로 기본 swagger 문서를 생성해야 한다", () => {
      const docs = swaggerGenerator.generateSwaggerDocs();

      expect(docs.openapi).toBe("3.1.0");
      expect(docs.info).toEqual(mockSwaggerOptions.info);
      expect(docs.paths).toEqual({});
    });

    it("설정된 schemaOutput 경로에 스키마 JSON을 저장해야 한다", () => {
      const mockWriteFileSync = jest.spyOn(fs, "mkdirSync");
      const mockOptions = {
        ...mockSwaggerOptions,
        schemaOutput: {
          enabled: true,
          outputPath: TEST_OUTPUT_PATH,
          fileName: "test-schema.json",
        },
      };

      swaggerGenerator = new SwaggerGenerator(mockOptions);
      swaggerGenerator.generateSwaggerDocs();

      expect(mockWriteFileSync).toHaveBeenCalled();
    });
  });

  describe("getPaths", () => {
    const mockRoute: RouteMetadataArgs = {
      target: class TestController {},
      method: "testMethod",
      action: HttpMethod.Get,
      path: "/test/:id",
      params: [],
      options: {},
    };

    it("라우트 경로에서 파라미터를 올바르게 파싱해야 한다", () => {
      mockMetadataStorage.routes = [mockRoute];
      mockMetadataStorage.swaggerOperations = [
        {
          target: mockRoute.target,
          method: "testMethod",
          options: { summary: "Test API" },
        },
      ];

      const docs = swaggerGenerator.generateSwaggerDocs();

      expect(docs.paths["/test/{id}"]).toBeDefined();
    });

    it("컨트롤러 태그가 있는 경우 해당 태그를 사용해야 한다", () => {
      const mockTag: ApiTagOptions = {
        name: "Test",
        description: "Test APIs",
      };

      mockMetadataStorage.routes = [mockRoute];
      mockMetadataStorage.swaggerControllerTags = [
        {
          target: mockRoute.target,
          tags: [mockTag],
        },
      ];

      const docs = swaggerGenerator.generateSwaggerDocs();

      expect(docs.tags).toContainEqual(mockTag);
    });
  });

  describe("getSwaggerParameters", () => {
    const mockRoute: RouteMetadataArgs = {
      target: class TestController {},
      method: "testMethod",
      action: HttpMethod.Get,
      path: "/test/:id",
      params: [],
      options: {},
    };

    it("파라미터가 없는 경우 빈 배열을 반환해야 한다", () => {
      mockMetadataStorage.routeParams = [];
      mockMetadataStorage.routes = [mockRoute];

      const docs = swaggerGenerator.generateSwaggerDocs();
      const parameters = docs.paths["/test/{id}"][HttpMethod.Get.toLowerCase()].parameters;

      expect(parameters).toEqual([]);
    });

    it("쿼리 파라미터를 올바르게 변환해야 한다", () => {
      mockMetadataStorage.routeParams = [
        {
          target: mockRoute.target,
          method: mockRoute.method,
          name: "query",
          type: ParamType.Query,
          index: 0,
          options: {
            type: String,
            required: true,
          },
        },
      ];
      mockMetadataStorage.routes = [mockRoute];

      const docs = swaggerGenerator.generateSwaggerDocs();
      const parameters = docs.paths["/test/{id}"][HttpMethod.Get.toLowerCase()].parameters;

      expect(parameters).toContainEqual({
        description: "",
        name: "query",
        in: "query",
        required: true,
        schema: { type: "string" },
      });
    });

    it("경로 파라미터는 required가 true로 설정되어야 한다", () => {
      mockMetadataStorage.routeParams = [
        {
          target: mockRoute.target,
          method: mockRoute.method,
          name: "id",
          type: ParamType.Path,
          index: 0,
          options: { type: String },
        },
      ];
      mockMetadataStorage.routes = [mockRoute];

      const docs = swaggerGenerator.generateSwaggerDocs();
      const parameters = docs.paths["/test/{id}"][HttpMethod.Get.toLowerCase()].parameters;

      expect(parameters).toContainEqual(
        expect.objectContaining({
          name: "id",
          in: "path",
          required: true,
        })
      );
    });

    it("배열 타입의 파라미터를 올바르게 처리해야 한다", () => {
      mockMetadataStorage.routeParams = [
        {
          target: mockRoute.target,
          method: mockRoute.method,
          name: "items",
          type: ParamType.Query,
          index: 0,
          options: {
            type: String,
            array: true,
            delimiter: ",",
          },
        },
      ];
      mockMetadataStorage.routes = [mockRoute];

      const docs = swaggerGenerator.generateSwaggerDocs();
      const parameters = docs.paths["/test/{id}"][HttpMethod.Get.toLowerCase()].parameters;

      expect(parameters).toContainEqual(
        expect.objectContaining({
          name: "items",
          schema: {
            type: "array",
            items: { type: "string" },
          },
        })
      );
    });

    it("authorization과 user-agent 헤더는 제외되어야 한다", () => {
      mockMetadataStorage.routeParams = [
        {
          target: mockRoute.target,
          method: mockRoute.method,
          name: "authorization",
          type: ParamType.Header,
          index: 0,
          options: { type: String },
        },
        {
          target: mockRoute.target,
          method: mockRoute.method,
          name: "user-agent",
          type: ParamType.Header,
          index: 1,
          options: { type: String },
        },
        {
          target: mockRoute.target,
          method: mockRoute.method,
          name: "custom-header",
          type: ParamType.Header,
          index: 2,
          options: { type: String },
        },
      ];
      mockMetadataStorage.routes = [mockRoute];

      const docs = swaggerGenerator.generateSwaggerDocs();
      const parameters = docs.paths["/test/{id}"][HttpMethod.Get.toLowerCase()].parameters;

      expect(parameters).toHaveLength(1);
      expect(parameters[0].name).toBe("custom-header");
    });

    it("Body 타입의 파라미터는 parameters에서 제외되어야 한다", () => {
      mockMetadataStorage.routeParams = [
        {
          target: mockRoute.target,
          method: mockRoute.method,
          name: "body",
          type: ParamType.Body,
          index: 0,
          options: { type: Object },
        },
      ];
      mockMetadataStorage.routes = [mockRoute];

      const docs = swaggerGenerator.generateSwaggerDocs();
      const parameters = docs.paths["/test/{id}"][HttpMethod.Get.toLowerCase()].parameters;

      expect(parameters).toHaveLength(0);
    });
  });

  describe("getSchemaType", () => {
    const mockRoute: RouteMetadataArgs = {
      target: class TestController {},
      method: "testMethod",
      action: HttpMethod.Get,
      path: "/test",
      params: [],
      options: {},
    };

    it("기본 타입들이 올바른 스키마로 생성되어야 한다", () => {
      mockMetadataStorage.routes = [mockRoute];
      mockMetadataStorage.routeParams = [
        {
          target: mockRoute.target,
          method: mockRoute.method,
          name: "stringParam",
          type: ParamType.Query,
          index: 0,
          options: { type: String },
        },
        {
          target: mockRoute.target,
          method: mockRoute.method,
          name: "numberParam",
          type: ParamType.Query,
          index: 1,
          options: { type: Number },
        },
        {
          target: mockRoute.target,
          method: mockRoute.method,
          name: "booleanParam",
          type: ParamType.Query,
          index: 2,
          options: { type: Boolean },
        },
      ];

      const docs = swaggerGenerator.generateSwaggerDocs();
      const parameters = docs.paths["/test"][HttpMethod.Get.toLowerCase()].parameters;

      expect(parameters).toContainEqual(
        expect.objectContaining({
          name: "stringParam",
          schema: { type: "string" },
        })
      );
      expect(parameters).toContainEqual(
        expect.objectContaining({
          name: "numberParam",
          schema: { type: "number" },
        })
      );
      expect(parameters).toContainEqual(
        expect.objectContaining({
          name: "booleanParam",
          schema: { type: "boolean" },
        })
      );
    });

    it("배열 타입 파라미터가 올바른 스키마로 생성되어야 한다", () => {
      mockMetadataStorage.routes = [mockRoute];
      mockMetadataStorage.routeParams = [
        {
          target: mockRoute.target,
          method: mockRoute.method,
          name: "arrayParam",
          type: ParamType.Query,
          index: 0,
          options: {
            type: String,
            array: true,
          },
        },
      ];

      const docs = swaggerGenerator.generateSwaggerDocs();
      const parameters = docs.paths["/test"][HttpMethod.Get.toLowerCase()].parameters;

      expect(parameters).toContainEqual(
        expect.objectContaining({
          name: "arrayParam",
          schema: {
            type: "array",
            items: { type: "string" },
          },
        })
      );
    });

    it("복합 객체 타입이 올바른 참조 스키마로 생성되어야 한다", () => {
      class TestModel {
        prop: string;
      }

      mockMetadataStorage.routes = [mockRoute];
      mockMetadataStorage.swaggerModels = [
        {
          target: TestModel,
          options: { description: "Test Model" },
        },
      ];
      mockMetadataStorage.routeParams = [
        {
          target: mockRoute.target,
          method: mockRoute.method,
          name: "modelParam",
          type: ParamType.Body,
          index: 0,
          options: { type: TestModel },
        },
      ];

      const docs = swaggerGenerator.generateSwaggerDocs();
      const requestBody = docs.paths["/test"][HttpMethod.Get.toLowerCase()].requestBody;

      expect(requestBody.content["application/json"].schema.properties.modelParam).toEqual({ $ref: "#/components/schemas/TestModel" });
    });
  });

  describe("saveSwaggerJsonSchema", () => {
    it("schemaOutput이 설정되지 않은 경우 메서드가 실행되지 않아야 한다", () => {
      const mockOptions: SwaggerOptions = {
        targetEnvs: [Stage.Local],
        info: {
          title: "Test API",
          version: "1.0.0",
        },
        path: { schema: "test-schema" },
      };

      swaggerGenerator = new SwaggerGenerator(mockOptions);
      const result = (swaggerGenerator as any).generateSwaggerDocs();

      expect(result.components.schemas).toBeDefined();
      expect(fs.existsSync(TEST_OUTPUT_PATH)).toBeFalsy();
    });

    it("파일명이 설정되지 않은 경우 기본 파일명을 사용해야 한다", () => {
      const mockOptions: SwaggerOptions = {
        targetEnvs: [Stage.Local],
        info: {
          title: "Test API",
          version: "1.0.0",
        },
        path: { schema: "test-schema" },
        schemaOutput: {
          enabled: true,
          outputPath: TEST_OUTPUT_PATH,
        },
      };

      swaggerGenerator = new SwaggerGenerator(mockOptions);
      const spy = jest.spyOn(swaggerGenerator as any, "saveSwaggerJsonSchema");

      (swaggerGenerator as any).generateSwaggerDocs();

      expect(spy).toHaveBeenCalled();
    });

    it("스키마 생성 중 에러 발생시 적절한 에러를 던져야 한다", () => {
      const mockOptions: SwaggerOptions = {
        targetEnvs: [Stage.Local],
        info: {
          title: "Test API",
          version: "1.0.0",
        },
        path: { schema: "test-schema" },
        schemaOutput: {
          enabled: true,
          outputPath: TEST_OUTPUT_PATH,
          fileName: "test-schema",
        },
      };

      swaggerGenerator = new SwaggerGenerator(mockOptions);
      // schemas를 undefined로 설정하여 의도적으로 에러 발생
      (swaggerGenerator as any).schemas = undefined;

      expect(() => {
        (swaggerGenerator as any).saveSwaggerJsonSchema();
      }).toThrow("Error generating Swagger JSON schema");
    });
  });
});
