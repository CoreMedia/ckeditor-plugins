// eslint-disable-next-line @typescript-eslint/no-require-imports
import jestConfig from "./jest.config.cjs";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import localPlaywrightConfig from "./jest-playwright.local.js";

export default {
  ...jestConfig,
  testEnvironmentOptions: {
    "jest-playwright": {
      ...localPlaywrightConfig
    }
  }
};
