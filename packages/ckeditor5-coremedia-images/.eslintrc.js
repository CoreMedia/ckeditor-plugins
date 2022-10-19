module.exports = {
  parser: "@typescript-eslint/parser",
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: "./src/tsconfig.json",
      },
      rules: {
        // Broken window, we may want to address later.
        "@typescript-eslint/no-floating-promises": "off",
      },
    },
  ],
};
