const babelConfig = require("@coremedia-internal/ckeditor5-babel-config");

module.exports = {
  testEnvironment: require.resolve("jest-environment-jsdom"),
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
  transformIgnorePatterns: ["node_modules/.pnpm/(?!@ckeditor|lodash-es|ckeditor5|rxjs)"],
};
