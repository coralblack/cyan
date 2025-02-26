import fs from "fs";
import path from "path";
import { RecordSchemaType } from "@coralblack/cyan/dist/core";
import { TypescriptSchemaGenerator } from "@coralblack/cyan/dist/core/TypescriptSwaggerGenerator";
import { DefaultSwaggerSchemaInitializer } from "@coralblack/cyan/dist/helper/SchemaInitializer";

jest.mock("fs");
jest.mock("path");
jest.mock("@coralblack/cyan/dist/core/TypescriptSwaggerGenerator");

describe("DefaultSwaggerSchemaInitializer", () => {
  let initializer: DefaultSwaggerSchemaInitializer;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("initializeSchemas", () => {
    it("schema 옵션이 주어졌을 때 loadSchemaFromFile을 호출해야 한다", () => {
      const schemaPath = "./test-schema.json";
      const mockSchema: RecordSchemaType = {
        TestSchema: {
          type: "object",
          properties: { test: { type: "string" } },
        },
      };

      initializer = new DefaultSwaggerSchemaInitializer({ schema: schemaPath });

      jest.spyOn(initializer as any, "loadSchemaFromFile").mockReturnValue(mockSchema);

      const result = initializer.initializeSchemas();

      expect(result).toBe(mockSchema);
      expect(initializer["loadSchemaFromFile"]).toHaveBeenCalledWith(schemaPath);
    });

    it("types 옵션이 주어졌을 때 generateSchemaFromTypes를 호출해야 한다", () => {
      const typePaths = ["./test-types.ts"];
      const mockSchema: RecordSchemaType = {
        TestType: {
          type: "object",
          properties: { id: { type: "number" } },
        },
      };

      initializer = new DefaultSwaggerSchemaInitializer({ types: typePaths });

      jest.spyOn(initializer as any, "generateSchemaFromTypes").mockReturnValue(mockSchema);

      const result = initializer.initializeSchemas();

      expect(result).toBe(mockSchema);
      expect(initializer["generateSchemaFromTypes"]).toHaveBeenCalledWith(typePaths);
    });

    it("schema와 types가 모두 없을 경우 빈 객체를 반환해야 한다", () => {
      const invalidPath = {};

      initializer = new DefaultSwaggerSchemaInitializer(invalidPath);

      const result = initializer.initializeSchemas();

      expect(result).toEqual({});
    });

    it("스키마 초기화 중 에러가 발생하면 적절한 에러 메시지를 포함해야 한다", () => {
      const errorMessage = "Test error";

      initializer = new DefaultSwaggerSchemaInitializer({ schema: "invalid.json" });

      jest.spyOn(initializer as any, "loadSchemaFromFile").mockImplementation(() => {
        throw new Error(errorMessage);
      });

      expect(() => initializer.initializeSchemas()).toThrow(`Schema initialization failed: ${errorMessage}`);
    });
  });

  describe("loadSchemaFromFile", () => {
    beforeEach(() => {
      initializer = new DefaultSwaggerSchemaInitializer({ schema: "test.json" });
    });

    it("파일이 존재하지 않을 경우 에러를 던져야 한다", () => {
      const testPath = "/test/path/schema.json";

      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (path.resolve as jest.Mock).mockReturnValue(testPath);

      expect(() => {
        initializer["loadSchemaFromFile"]("schema.json");
      }).toThrow(`Schema file not found at path: ${testPath}`);
    });

    it("유효한 JSON 파일을 읽어서 파싱해야 한다", () => {
      const mockSchema: RecordSchemaType = {
        TestSchema: {
          type: "object",
          properties: { test: { type: "string" } },
        },
      };
      const mockFileContent = JSON.stringify(mockSchema);

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockFileContent);

      const result = initializer["loadSchemaFromFile"]("valid.json");

      expect(result).toEqual(mockSchema);
    });

    it("잘못된 JSON 형식일 경우 에러를 던져야 한다", () => {
      const invalidJson = "{invalid:json}";
      const testPath = "/test/path/schema.json";

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(invalidJson);
      (path.resolve as jest.Mock).mockReturnValue(testPath);

      expect(() => {
        initializer["loadSchemaFromFile"]("invalid.json");
      }).toThrow(`Failed to parse schema file at ${testPath}`);
    });
  });

  describe("generateSchemaFromTypes", () => {
    beforeEach(() => {
      initializer = new DefaultSwaggerSchemaInitializer({ types: ["test.ts"] });
    });

    it("빈 타입 경로 배열이 주어졌을 때 에러를 던져야 한다", () => {
      expect(() => {
        initializer["generateSchemaFromTypes"]([]);
      }).toThrow("Types path array is empty or not defined");
    });

    it("TypeScript 모듈 로드에 실패할 경우 에러를 던져야 한다", () => {
      jest.spyOn(initializer as any, "loadTypeScriptModule").mockImplementation(() => {
        throw new Error("TypeScript is required");
      });

      expect(() => {
        initializer["generateSchemaFromTypes"](["test.ts"]);
      }).toThrow("TypeScript is required");
    });

    it("스키마 생성이 성공적으로 완료되어야 한다", () => {
      const mockSchema: RecordSchemaType = {
        TestType: {
          type: "object",
          properties: { id: { type: "number" } },
        },
      };

      jest.spyOn(TypescriptSchemaGenerator.prototype, "generateSchema").mockReturnValue(mockSchema);

      const result = initializer["generateSchemaFromTypes"](["test.ts"]);

      expect(result).toEqual(mockSchema);
    });
  });
});
