module.exports = {
  parser: "@typescript-eslint/parser",
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./__tests__/tsconfig.json", "./src/tsconfig.json"],
      },
      rules: {
        /*
         * Lib-DOM uses `null` as return type a lot. Thus, we want to deal
         * with `null` values in here, too.
         */
        "no-null/no-null": "off",
      },
    },
  ],
};
