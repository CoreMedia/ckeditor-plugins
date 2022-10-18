module.exports = {
  parser: "@typescript-eslint/parser",
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          "./__tests__/tsconfig.json",
          "./src/tsconfig.json"
        ],
      },
    },
  ],
};
