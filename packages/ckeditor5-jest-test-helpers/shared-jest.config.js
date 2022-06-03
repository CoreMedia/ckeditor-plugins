const babelConfig = require("@coremedia-internal/ckeditor5-babel-config");

// We still have to use Jest 27 in this module, affected by https://github.com/facebook/jest/issues/9771
/**
 * Required workaround for Jest Module Resolution
 * (https://github.com/facebook/jest/issues/9771) as long as Jest Playwright
 * does not support Jest 28
 * (https://github.com/playwright-community/jest-playwright/issues/796).
 *
 * Observed issues with pnpm mixing 27.5.1 and 28.x Jest dependencies, when
 * both are used in workspace, enforce to skip upgrade to 28.x until
 * playwright-community/jest-playwright#796 is resolved.
 */
const resolver = require.resolve("./enhanced-resolve-jest27.js");

module.exports = {
  testEnvironment: require.resolve("jest-environment-jsdom"),
  // Don't detect utility files as tests, i.e. require `test` in name.
  testMatch: [
    "**/?(*.)+(test).[jt]s?(x)",
  ],
  moduleFileExtensions: ["js", "ts", "d.ts"],
  "moduleNameMapper": {
    // https://www.npmjs.com/package/jest-transform-stub
    "^.+\\.(css|less|sass|scss|gif|png|jpg|ttf|eot|woff|woff2|svg)$": require.resolve("jest-transform-stub"),
  },
  transform: {
    "^.+\\.[jt]sx?$": [require.resolve("babel-jest"), babelConfig],
    // https://www.npmjs.com/package/jest-transform-stub
    "^.+\\.(css|less|sass|scss|gif|png|jpg|ttf|eot|woff|woff2|svg)$": require.resolve("jest-transform-stub"),
  },
  transformIgnorePatterns: [
    "node_modules/.pnpm/(?!@ckeditor|lodash-es|ckeditor5|rxjs)"
  ],
  resolver,
};
