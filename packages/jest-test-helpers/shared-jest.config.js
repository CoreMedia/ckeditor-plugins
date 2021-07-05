const babelConfig = require("../../shared-babel.config.js");

module.exports = {
  // https://github.com/facebook/jest/issues/8896
  // passWithNoTests: true,
  testEnvironment: 'jsdom',
  moduleFileExtensions: ["js", "ts", "d.ts"],
  // see https://jestjs.io/docs/webpack#handling-static-assets
  "moduleNameMapper": {
    "\\.(css|less)$": require.resolve("./__mocks__/styleMock.js"),
    "\\.(gif|ttf|eot|svg)$": require.resolve("./__mocks__/fileMock.js"),
  },
  transform: {
    "^.+\\.[jt]sx?$": ["babel-jest", babelConfig],
  },
  transformIgnorePatterns: [
    "node_modules/.pnpm/(?!@ckeditor|lodash-es|ckeditor5|rxjs)"
  ],
  resolver: require.resolve("./enhanced-resolve.js"),
};
