// eslint-disable-next-line @typescript-eslint/no-require-imports
const jestConfig = require("./jest.config.cjs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const localPlaywrightConfig = require("./jest-playwright.local.js");

module.exports = {
  ...jestConfig,
  testEnvironmentOptions: {
    "jest-playwright": {
      ...localPlaywrightConfig,
    },
  },
};
