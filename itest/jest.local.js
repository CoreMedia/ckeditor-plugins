const jestConfig = require("./jest.config.cjs");
const localPlaywrightConfig = require("./jest-playwright.local.js");

module.exports = {
  ...jestConfig,
  testEnvironmentOptions: {
    "jest-playwright": {
      ...localPlaywrightConfig,
    },
  },
};
