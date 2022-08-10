const jestConfig = require("@coremedia-internal/ckeditor5-jest-test-helpers/shared-jest.config.js");

module.exports = {
  ...jestConfig,
  roots: ["<rootDir>/src/"],
  // The default timeout is 5000. This may be not enough for Jest Playwright
  // tests. If the test fails due to test-timeout, we will only get unspecific
  // failures `Exceeded timeout`.
  testTimeout: 60000,
  preset: "jest-playwright-preset",
  // Override from shared config.
  testEnvironment: "jest-playwright-preset",
  setupFilesAfterEnv: [require.resolve("expect-playwright")],
};
