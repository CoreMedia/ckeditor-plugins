const jestConfig = require("@coremedia-internal/ckeditor5-jest-test-helpers/shared-jest.config.js");

module.exports = {
  ...jestConfig,
  preset: "jest-playwright-preset",
  testEnvironment: "./playwright.environment.js",
  setupFilesAfterEnv: ["expect-playwright"],
};
