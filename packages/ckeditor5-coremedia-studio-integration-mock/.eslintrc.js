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
      rules: {
        // Broken window, we may want to address later.
        "@typescript-eslint/require-await": "off",
      },
    },
  ],
};
