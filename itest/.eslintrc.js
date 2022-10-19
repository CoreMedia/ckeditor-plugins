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
        // May need some review. Used in context of waiting for the CKEditor
        // to become available.
        "@typescript-eslint/await-thenable": "off",
        // Broken window, we may want to address later.
        "@typescript-eslint/no-floating-promises": "off",
      },
    },
  ],
};
