import { defineConfig, globalIgnores } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import tsdoc from "eslint-plugin-tsdoc";
import _import from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import stylistic from "@stylistic/eslint-plugin";
import { fixupPluginRules } from "@eslint/compat";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export const configs = defineConfig([
  {
    languageOptions: {
      parser: tsParser
    },

    plugins: {
      "@typescript-eslint": typescriptEslint,
      jsdoc,
      tsdoc,
      "import": fixupPluginRules(_import),
      "unused-imports": unusedImports,
      "@stylistic": stylistic
    }
  },
  globalIgnores([
    "**/dist/",
    "**/docs/",
    "**/node_modules/",
    "**/typings/",
    "**/*.orig",
    "**/src/**/*.js",
    "**/src/**/*.d.ts"
  ]),
  {
    files: ["**/*.{js,cjs,mjs,ts,tsx}"],
    extends: compat.extends("prettier", "plugin:prettier/recommended"),

    rules: {
      "prettier/prettier": "error"
    }
  },
  {
    files: ["**/*.js"],
    extends: compat.extends("eslint:recommended")
  },
  {
    files: ["**/*.config.{js,cjs,mjs}", "**/*.local.{js,cjs,mjs}", "**/*rc.{js,cjs,mjs}"],

    rules: {
      "no-undef": "off",
      "no-unused-vars": "off"
    }
  },
  {
    files: ["**/*.{ts,tsx}"],

    extends: compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "plugin:@typescript-eslint/strict"
    ),

    rules: {
      "no-prototype-builtins": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/non-nullable-type-assertion-style": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/unbound-method": "off",
      "jsdoc/empty-tags": "off",
      "jsdoc/no-undefined-types": "off",
      "jsdoc/tag-lines": "off",
      "arrow-body-style": ["error", "as-needed"],
      "consistent-return": "error",
      "constructor-super": "error",
      "curly": ["error", "multi-line"],
      "dot-notation": "error",
      "eqeqeq": "error",
      "import/no-duplicates": "error",
      "linebreak-style": ["off", "windows"],

      "max-statements-per-line": [
        "error",
        {
          max: 1
        }
      ],

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
        {
          name: "setTimeout"
        },
        {
          name: "clearTimeout"
        },
        {
          name: "setInterval"
        },
        {
          name: "clearInterval"
        },
        {
          name: "setImmediate"
        },
        {
          name: "clearImmediate"
        }
      ],

      "no-restricted-syntax": [
        "error",
        {
          selector: ":matches(PropertyDefinition, MethodDefinition[kind=\"method\"])[accessibility=\"private\"]",
          message: "Use #private instead"
        }
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
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-object-spread": "error",
      "quote-props": ["error", "consistent-as-needed"],
      "space-in-parens": "error",
      "unicode-bom": ["error", "never"],
      "use-isnan": "error",
      "unused-imports/no-unused-imports": "error",

      "import/no-extraneous-dependencies": [
        "error",
        {
          optionalDependencies: false,
          devDependencies: true
        }
      ],

      "jsdoc/check-alignment": "error",
      "jsdoc/check-param-names": "error",

      "jsdoc/check-tag-names": [
        "error",
        {
          definedTags: ["category", "packageDocumentation", "typeParam"]
        }
      ],

      "jsdoc/no-multi-asterisks": [
        "error",
        {
          allowWhitespace: true
        }
      ],

      "jsdoc/require-jsdoc": "error",
      "jsdoc/require-param": "off",
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-returns-type": "off",
      "jsdoc/valid-types": "off",
      "@typescript-eslint/adjacent-overload-signatures": "error",
      "@typescript-eslint/array-type": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "brace-style": "off",

      "@stylistic/brace-style": [
        "error",
        "1tbs",
        {
          allowSingleLine: true
        }
      ],

      "@typescript-eslint/consistent-generic-constructors": "error",
      "@typescript-eslint/consistent-indexed-object-style": "error",

      "@typescript-eslint/consistent-type-assertions": [
        "error",
        {
          assertionStyle: "as"
        }
      ],

      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],

      "@typescript-eslint/no-base-to-string": "error",
      "@typescript-eslint/no-dynamic-delete": "error",
      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-extraneous-class": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-invalid-void-type": "error",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-this-alias": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "no-unused-expressions": "off",

      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowTernary: true,
          allowShortCircuit: true
        }
      ],

      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/prefer-includes": "error",
      "@typescript-eslint/prefer-namespace-keyword": "error",

      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/prefer-ts-expect-error": "error",
      "quotes": "off",

      "@stylistic/quotes": [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: "always"
        }
      ],

      "@typescript-eslint/restrict-plus-operands": "error",
      "semi": "off",
      "@stylistic/semi": "error",
      "space-before-function-paren": "off",

      "@stylistic/space-before-function-paren": [
        "error",
        {
          asyncArrow: "always",
          anonymous: "always",
          named: "never"
        }
      ],

      "@typescript-eslint/triple-slash-reference": "error",
      "@stylistic/type-annotation-spacing": "error",
      "@typescript-eslint/unified-signatures": "error"
    }
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/itest/**/*.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}", "**/*.spec.{ts,tsx}"],

    rules: {
      "no-irregular-whitespace": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "jsdoc/require-jsdoc": "off"
    }
  },
  {
    files: ["app/**/*.{ts,tsx}"],

    rules: {
      "jsdoc/require-jsdoc": "off"
    }
  }
]);
