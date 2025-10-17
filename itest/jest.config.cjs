const babelConfig = require("@coremedia-internal/ckeditor5-babel-config");

module.exports = {
  roots: ["<rootDir>/src/"],
  // The default timeout is 5000. This may be not enough for Jest Playwright
  // tests. If the test fails due to test-timeout, we will only get unspecific
  // failures `Exceeded timeout`.
  testTimeout: 60000,
  preset: "jest-playwright-preset",
  // Override from shared config.
  testEnvironment: require.resolve("jest-playwright-preset"),
  setupFilesAfterEnv: [require.resolve("expect-playwright")],
  // Don't detect utility files as tests, i.e. require `test` in name.
  testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
  moduleFileExtensions: ["js", "ts", "d.ts"],
  moduleNameMapper: {
    // https://www.npmjs.com/package/jest-transform-stub
    "^.+\\.(css|less|sass|scss|gif|png|jpg|ttf|eot|woff|woff2|svg)$": require.resolve("jest-transform-stub"),
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // ts-jest configuration goes here
      },
    ],
    // Required, e.g., for CKEditor 5 Dependencies.
    "^.+\\.jsx?$": [require.resolve("babel-jest"), babelConfig],
    // https://www.npmjs.com/package/jest-transform-stub
    "^.+\\.(css|less|sass|scss|gif|png|jpg|ttf|eot|woff|woff2|svg)$": require.resolve("jest-transform-stub"),
  },
  transformIgnorePatterns: ["node_modules/.pnpm/(?!@ckeditor|@bbob|lodash-es|rxjs|ckeditor5|vanilla-colorful)"],
};
