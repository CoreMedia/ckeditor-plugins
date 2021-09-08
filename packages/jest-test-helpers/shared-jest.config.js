const babelConfig = require("../../shared-babel.config.js");

module.exports = {
  // https://github.com/facebook/jest/issues/8896
  // passWithNoTests: true,
  testEnvironment: 'jsdom',
  moduleFileExtensions: ["js", "ts", "d.ts"],
  // see https://jestjs.io/docs/webpack#handling-static-assets
  "moduleNameMapper": {
    "^.+\\.(css|less|sass|scss|gif|png|jpg|ttf|eot|woff|woff2|svg)$": "jest-transform-stub",
  },
  transform: {
    "^.+\\.[jt]sx?$": ["babel-jest", babelConfig],
    // https://www.npmjs.com/package/jest-svg-transformer
    // https://www.npmjs.com/package/jest-cra-svg-transform
    // https://www.npmjs.com/package/jest-transform-stub
    "^.+\\.(css|less|sass|scss|gif|png|jpg|ttf|eot|woff|woff2|svg)$": "jest-transform-stub",
  },
  transformIgnorePatterns: [
    "node_modules/.pnpm/(?!@ckeditor|lodash-es|ckeditor5|rxjs)"
  ],
  resolver: require.resolve("./enhanced-resolve.js"),
};
