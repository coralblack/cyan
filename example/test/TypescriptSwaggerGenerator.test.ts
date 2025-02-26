import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

import { TypescriptSchemaGenerator } from "../../dist/core/TypescriptSwaggerGenerator";
import { TypeScriptFileResolver } from "../../dist/helper";

jest.mock("../../dist/helper/TypescriptFileResolver");

describe("TypescriptSchemaGenerator", () => {
  let generator: TypescriptSchemaGenerator;
  const mockFilePaths = ["test.ts"];

  beforeEach(() => {
    jest.restoreAllMocks();
    generator = new TypescriptSchemaGenerator(ts, ["src/**/*.ts"]);

    (TypeScriptFileResolver as jest.Mock).mockImplementation(() => ({
      getFilePaths: () => mockFilePaths,
      readTsConfig: () => ({ options: {} }),
    }));
  });

  describe("generateSchema", () => {
    beforeEach(() => {
      // 임시 타입스크립트 파일 생성
      const tempFile = path.join(process.cwd(), "test.ts");

      if (!fs.existsSync(tempFile)) {
        fs.writeFileSync(tempFile, "", "utf8");
      }
    });

    afterEach(() => {
      // 임시 파일 정리
      const tempFile = path.join(process.cwd(), "test.ts");

      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    });

    it("파일에 유효한 타입이 없다면 빈 스키마를 생성해야 한다", () => {
      const schema = generator.generateSchema();

      expect(schema).toEqual({});
    });

    it("인터페이스에 대해 올바른 스키마를 생성해야 한다", () => {
      const source = `
        interface User {
          id: number;
          name: string;
          isActive: boolean;
        }
      `;

      fs.writeFileSync("test.ts", source, "utf8");

      const schema = generator.generateSchema();

      expect(schema).toHaveProperty("User");
      expect(schema.User).toEqual({
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["id", "name", "isActive"],
      });
    });

    it("제네릭 타입을 object로 처리해야 한다", () => {
      const source = `
        interface Foo<T> {
          value: T;
        }
      `;

      fs.writeFileSync("test.ts", source, "utf8");

      const schema = generator.generateSchema();

      expect(schema.Foo).toEqual({
        type: "object",
        properties: { value: { type: "object", description: "Generic type: T" } },
        required: ["value"],
        description: undefined,
        example: undefined,
      });
    });

    it("인터페이스의 배열 타입을 올바르게 생성해야 한다", () => {
      const source = `
        interface List {
          items: string[];
        }
      `;

      fs.writeFileSync("test.ts", source, "utf8");

      const schema = generator.generateSchema();

      expect(schema.List).toEqual({
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["items"],
      });
    });

    it("유니온 타입을 올바르게 생성해야 한다", () => {
      const source = `
        type Status = "active" | "inactive";
      `;

      fs.writeFileSync("test.ts", source, "utf8");

      const schema = generator.generateSchema();

      expect(schema.Status).toEqual({ oneOf: [{ type: "object" }, { type: "object" }] });
    });

    it("인터섹션 타입을 올바르게 생성해야 한다", () => {
      const source = `
        interface Name { name: string; }
        interface Age { age: number; }
        type Person = Name & Age;
      `;

      fs.writeFileSync("test.ts", source, "utf8");

      const schema = generator.generateSchema();

      expect(schema.Person).toEqual({ allOf: [{ $ref: "#/components/schemas/Name" }, { $ref: "#/components/schemas/Age" }] });
    });

    it("JSDoc 주석을 스키마에 반영해야 한다", () => {
      const source = `
        /**
         * @description User information
         * @example { "name": "John" }
         */
        interface User {
          name: string;
        }
      `;

      fs.writeFileSync("test.ts", source, "utf8");

      const schema = generator.generateSchema();

      expect(schema.User).toMatchObject({
        description: "User information",
        example: '{ "name": "John" }',
      });
    });
  });
});
