import path from "path";
import { TypeScriptFileResolver } from "@coralblack/cyan/dist/helper/TypescriptFileResolver";
import { glob } from "glob";
import typescript from "typescript";

jest.mock("path");
jest.mock("glob");

describe("TypeScriptFileResolver", () => {
  let resolver: TypeScriptFileResolver;
  let mockTs: typeof typescript;

  beforeEach(() => {
    jest.restoreAllMocks();
    mockTs = {
      readConfigFile: jest.fn(),
      parseJsonConfigFileContent: jest.fn(),
      sys: { readFile: jest.fn() },
    } as unknown as typeof typescript;
  });

  describe("getFilePaths", () => {
    it("include 패턴의 파일들을 찾아야 한다", () => {
      const patterns = ["src/**/*.ts"];
      const expectedFiles = ["src/file1.ts", "src/file2.ts"];

      jest.spyOn(glob, "sync").mockImplementation(() => expectedFiles);

      resolver = new TypeScriptFileResolver(mockTs, patterns);
      const result = resolver.getFilePaths();

      expect(result).toEqual(expectedFiles);
      expect(glob.sync).toHaveBeenCalledWith(patterns[0]);
    });

    it("exclude 패턴의 파일들을 제외해야 한다", () => {
      const patterns = ["src/**/*.ts", "!src/**/*.test.ts"];
      const includedFiles = ["src/file1.ts", "src/file2.ts", "src/file.test.ts"];
      const excludedFiles = ["src/file.test.ts"];

      const globSyncSpy = jest.spyOn(glob, "sync");

      globSyncSpy.mockReturnValueOnce(includedFiles); // 첫 번째 호출 (include 패턴)
      globSyncSpy.mockReturnValueOnce(excludedFiles); // 두 번째 호출 (exclude 패턴)

      resolver = new TypeScriptFileResolver(mockTs, patterns);
      const result = resolver.getFilePaths();

      expect(result).toEqual(["src/file1.ts", "src/file2.ts"]);
      expect(globSyncSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("readTsConfig", () => {
    beforeEach(() => {
      resolver = new TypeScriptFileResolver(mockTs, []);

      // process.cwd() 모킹
      jest.spyOn(process, "cwd").mockReturnValue("/test/project");

      // path.join 모킹
      (path.join as jest.Mock).mockImplementation((...args) => args.join("/"));
    });

    it("TypeScript가 초기화되지 않았을 때 에러를 던져야 한다", () => {
      resolver = new TypeScriptFileResolver(undefined as any, []);

      expect(() => resolver.readTsConfig()).toThrow("TypeScriptFileResolver not initialized. Call initialize() first.");
    });

    it("tsconfig.json을 성공적으로 가져와야 한다", () => {
      const mockConfig = { compilerOptions: {} };
      const mockParsedConfig = { options: {}, fileNames: [], errors: [] };

      (mockTs.readConfigFile as jest.Mock).mockReturnValue({ config: mockConfig });

      (mockTs.parseJsonConfigFileContent as jest.Mock).mockReturnValue(mockParsedConfig);

      const result = resolver.readTsConfig();

      expect(result).toBe(mockParsedConfig);
      expect(mockTs.readConfigFile).toHaveBeenCalledWith("/test/project/tsconfig.json", mockTs.sys.readFile);
      expect(mockTs.parseJsonConfigFileContent).toHaveBeenCalledWith(mockConfig, mockTs.sys, "/test/project");
    });

    it("tsconfig.json 가져오는 데 실패시 에러를 던져야 한다", () => {
      const errorMessage = "Failed to read config";

      (mockTs.readConfigFile as jest.Mock).mockReturnValue({ error: { messageText: errorMessage } });

      expect(() => resolver.readTsConfig()).toThrow(`Error reading tsconfig.json: ${errorMessage}`);
    });
  });
});
