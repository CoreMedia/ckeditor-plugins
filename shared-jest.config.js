const babelConfig = require("./shared-babel.config.js");

module.exports = {
  // https://github.com/facebook/jest/issues/8896
  // passWithNoTests: true,
  testEnvironment: 'jsdom',
  moduleFileExtensions: ["js", "ts", "d.ts"],
  transform: {
    "^.+\\.[jt]sx?$": ["babel-jest", babelConfig],
  },
  transformIgnorePatterns: [
    "node_modules/(?!@ckeditor|lodash-es)"
  ],
  resolver: "../../enhanced-resolve.js"
};
