module.exports = {
  parser: "@typescript-eslint/parser",
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          "./__mocks__/@ckeditor/ckeditor5-utils/src/tsconfig.json",
          "./__tests__/tsconfig.json",
          "./src/tsconfig.json",
        ],
      },
    },
  ],
};
