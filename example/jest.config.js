module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  forceExit: true,
  collectCoverage: true,
  coverageReporters: ["lcov"],
  coveragePathIgnorePatterns: ["src/lib/", "node_modules/"],
  testMatch: ["**/*.test.ts", "!**/*.spec.ts"],
};
