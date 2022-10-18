// eslint-disable-next-line no-undef
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "jsdoc", "eslint-plugin-tsdoc", "no-null", "import", "unused-imports"],
  root: true,
  ignorePatterns: ["dist/", "docs/", "node_modules/", "*.orig"],
  overrides: [
    {
      files: ["**/*.js", "**/*.ts", "**/*.tsx"],
      extends: [
        // Prettier recommended for formatting rules: https://typescript-eslint.io/docs/linting/configs/#prettier
        "prettier",
        "plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
      ],
      rules: {
        "prettier/prettier": "warn",
      },
    },
    {
      files: ["**/*.js"],
      extends: ["eslint:recommended"],
    },
    {
      files: ["**/*.config.js", "**/*.local.js", "**/*rc.js"],
      rules: {
        "no-undef": "off",
        "no-unused-vars": "off",
      },
    },
    {
      files: ["**/*.ts", "**/*.tsx"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:@typescript-eslint/strict",
        "plugin:jsdoc/recommended",
      ],
      rules: {
        /*
         * =====================================================================
         * TypeScript/Broken Window
         *
         * Possibly fix later or adjust configuration. Prefer adding exclusions
         * to corresponding modules. As soon as multiple modules are affected,
         * add them to this configuration. Exception: If you consider a
         * violation to be addressed as soon as possible and only a few
         * modules are affected, duplicate the exclusions only in affected
         * modules.
         * =====================================================================
         */
        // Broken Window/ESLint
        "no-prototype-builtins": "off",
        // Broken Window/JSDoc
        "jsdoc/check-param-names": "off",
        "jsdoc/empty-tags": "off",
        "jsdoc/newline-after-description": "off",
        "jsdoc/no-multi-asterisks": "off",
        "jsdoc/tag-lines": "off",
        "jsdoc/require-jsdoc": "off",
        "jsdoc/require-param": "off",
        "jsdoc/require-returns": "off",
        "jsdoc/valid-types": "off",
        // Broken Window/TypeScript
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/restrict-plus-operands": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/unbound-method": "off",
        // Broken Window/TypeScript (Strict Rules)
        "@typescript-eslint/consistent-generic-constructors": "off",
        "@typescript-eslint/consistent-indexed-object-style": "off",
        "@typescript-eslint/no-base-to-string": "off",
        "@typescript-eslint/no-dynamic-delete": "off",
        "@typescript-eslint/no-extraneous-class": "off",
        "@typescript-eslint/no-invalid-void-type": "off",
        "@typescript-eslint/no-unnecessary-condition": "off",
        "@typescript-eslint/no-useless-constructor": "off",
        "@typescript-eslint/non-nullable-type-assertion-style": "off",
        "@typescript-eslint/prefer-includes": "off",
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/prefer-optional-chain": "off",
        /*
         * =====================================================================
         * ESLint
         * =====================================================================
         */
        "constructor-super": "error",
        "curly": ["error", "multi-line"],
        "dot-notation": "error",
        "eqeqeq": "error",
        // linebreak-style: First needs to be fixed on Windows.
        "linebreak-style": ["off", "windows"],
        "max-statements-per-line": ["error", { max: 1 }],
        "new-parens": "error",
        "no-caller": "error",
        "no-duplicate-case": "error",
        "no-empty": "error",
        "no-eval": "error",
        "no-extra-bind": "error",
        "no-extra-boolean-cast": "error",
        "no-fallthrough": "error",
        "no-new-func": "error",
        "no-new-wrappers": "error",
        "no-return-await": "error",
        "no-restricted-globals": [
          "error",
          { name: "setTimeout" },
          { name: "clearTimeout" },
          { name: "setInterval" },
          { name: "clearInterval" },
          { name: "setImmediate" },
          { name: "clearImmediate" },
        ],
        "no-sparse-arrays": "error",
        "no-template-curly-in-string": "error",
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-undef-init": "error",
        "no-unsafe-finally": "error",
        "no-unused-labels": "error",
        "no-useless-escape": "error",
        "no-var": "error",
        "object-shorthand": "error",
        "prefer-const": "error",
        "prefer-object-spread": "error",
        "quote-props": ["error", "consistent-as-needed"],
        "space-in-parens": "error",
        "unicode-bom": ["error", "never"],
        "use-isnan": "error",
        "unused-imports/no-unused-imports": "error",
        /*
         * =====================================================================
         * ESLint Plugin: Import
         * =====================================================================
         */
        "import/no-extraneous-dependencies": ["error", { optionalDependencies: false }],
        /*
         * =====================================================================
         * ESLint Plugin: JSDoc
         * =====================================================================
         */
        "jsdoc/check-alignment": "error",
        "jsdoc/require-param-type": "off",
        "jsdoc/require-returns-type": "off",
        "jsdoc/check-tag-names": [
          "error",
          {
            definedTags: ["category", "packageDocumentation", "typeParam"],
          },
        ],
        /*
         * =====================================================================
         * ESLint Plugin: No-Null
         * =====================================================================
         */
        "no-null/no-null": "error",
        /*
         * =====================================================================
         * ESLint Plugin: TypeScript
         * =====================================================================
         */
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "@typescript-eslint/array-type": "error",
        "@typescript-eslint/ban-ts-comment": "error",

        "brace-style": "off",
        "@typescript-eslint/brace-style": ["error", "1tbs", { allowSingleLine: true }],

        "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "as" }],
        "@typescript-eslint/consistent-type-definitions": ["error", "interface"],

        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: "typeLike",
            format: ["PascalCase"],
            filter: { regex: "^(__String|[A-Za-z]+_[A-Za-z]+)$", match: false },
          },
          {
            selector: "interface",
            format: ["PascalCase"],
            custom: { regex: "^I[A-Z]", match: false },
            filter: { regex: "^I(Arguments|TextWriter|O([A-Z][a-z]+[A-Za-z]*)?)$", match: false },
          },
          {
            selector: "variable",
            format: ["camelCase", "PascalCase", "UPPER_CASE"],
            leadingUnderscore: "allow",
            filter: { regex: "^(_{1,2}filename|_{1,2}dirname|_+|[A-Za-z]+_[A-Za-z]+)$", match: false },
          },
          {
            selector: "function",
            format: ["camelCase", "PascalCase"],
            leadingUnderscore: "allow",
            filter: { regex: "^[A-Za-z]+_[A-Za-z]+$", match: false },
          },
          {
            selector: "parameter",
            format: ["camelCase"],
            leadingUnderscore: "allow",
            filter: { regex: "^(_+|[A-Za-z]+_[A-Z][a-z]+)$", match: false },
          },
          {
            selector: "method",
            format: ["camelCase", "PascalCase"],
            leadingUnderscore: "allow",
            filter: { regex: "^([0-9]+|[A-Za-z]+_[A-Za-z]+)$", match: false },
          },
          {
            selector: "memberLike",
            format: ["camelCase"],
            leadingUnderscore: "allow",
            filter: { regex: "^([0-9]+|[A-Za-z]+_[A-Za-z]+)$", match: false },
          },
          {
            selector: "enumMember",
            format: ["camelCase", "PascalCase", "UPPER_CASE"],
            leadingUnderscore: "allow",
            filter: { regex: "^[A-Za-z]+_[A-Za-z]+$", match: false },
          },
          { selector: "property", format: null },
        ],

        "no-duplicate-imports": "off",
        "@typescript-eslint/no-duplicate-imports": "error",

        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-non-null-assertion": "error",
        "@typescript-eslint/no-this-alias": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",

        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": ["error", { allowTernary: true, allowShortCircuit: true }],

        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "error",

        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/prefer-ts-expect-error": "error",

        "quotes": "off",
        "@typescript-eslint/quotes": ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],

        "semi": "off",
        "@typescript-eslint/semi": "error",

        "space-before-function-paren": "off",
        "@typescript-eslint/space-before-function-paren": [
          "error",
          {
            asyncArrow: "always",
            anonymous: "always",
            named: "never",
          },
        ],

        "@typescript-eslint/triple-slash-reference": "error",
        "@typescript-eslint/type-annotation-spacing": "error",
        "@typescript-eslint/unified-signatures": "error",
      },
    },
    /*
     * Test-specific overrides.
     */
    {
      files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
      rules: {
        "no-irregular-whitespace": "off",
      },
    },
  ],
};
