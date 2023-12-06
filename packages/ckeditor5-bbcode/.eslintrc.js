module.exports = {
  parser: "@typescript-eslint/parser",
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json",
      },
      rules: {
        /*
         * BBob uses `null` a lot. Thus, we want to deal with `null` values in
         * here, too.
         */
        "no-null/no-null": "off",
      },
    },
  ],
};
