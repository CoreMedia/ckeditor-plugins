const babelConfig = require("@coremedia-internal/ckeditor5-babel-config");

module.exports = {
  // https://github.com/facebook/jest/issues/8896
  // passWithNoTests: true,
  testEnvironment: 'jsdom',
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
  resolver: require.resolve("./enhanced-resolve.js"),
};
