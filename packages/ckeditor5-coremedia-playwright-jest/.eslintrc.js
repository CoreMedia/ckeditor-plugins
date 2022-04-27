module.exports = {
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "eslint-plugin-tsdoc",
    "eslint-plugin-jest",
  ],
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  overrides: [
    {
      files: ["*.ts", "*.tsx"], // Your TypeScript files extension
      parserOptions: {
        project: ["__tests__/tsconfig.json"], // Specify it only for TypeScript files
        tsconfigRootDir: __dirname,
      },
    },
  ],
  extends: [
    "plugin:jest/recommended",
    "plugin:jest/style",
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from @typescript-eslint/eslint-plugin
    "prettier",
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    "plugin:playwright/jest-playwright",
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  ignorePatterns: ["dist/", "node_modules/"],
  rules: {
    "tsdoc/syntax": "warn",
  },
};
