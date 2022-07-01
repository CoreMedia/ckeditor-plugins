module.exports = {
  plugins: ["@typescript-eslint/eslint-plugin", "eslint-plugin-tsdoc"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"], // Your TypeScript files extension
      parserOptions: {
        project: ["src/tsconfig.json", "__tests__/tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
    },
  ],
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  extends: [
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from @typescript-eslint/eslint-plugin
    "prettier",
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  rules: {
    "tsdoc/syntax": "warn",
    "@typescript-eslint/no-this-alias": [
      "error",
      {
        allowedNames: ["self"], // Allow `const vm= this`; `[]` by default
      },
    ],
  },
  ignorePatterns: ["dist/", "node_modules/", "*.orig"],
};
