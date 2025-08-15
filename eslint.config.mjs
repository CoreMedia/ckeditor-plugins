import { defineConfig, globalIgnores } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import { fixupConfigRules } from "@eslint/compat";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import fs from "fs";
import path from "path";
import { packageDirectorySync } from "package-directory";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: rootDir,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

const packageJson = JSON.parse(
  fs.readFileSync(path.join(packageDirectorySync(rootDir), "package.json")).toString()
);

export const configs = defineConfig([{
  languageOptions: {
    parser: tsParser,
    ecmaVersion: "latest"
  },

  extends: fixupConfigRules(compat.extends(
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  )),
  // Custom CoreMedia rules for JS/TS packages
  rules: {
    "import/no-unresolved": "off",

    "import/order": ["error", {
      "newlines-between": "never"
    }],

    "import/newline-after-import": ["error"],
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: [packageJson.name, `${packageJson.name}/*`],
            message: "Please do not use self referencing imports."
          },
          {
            group: ["*/index"],
            message: "Please do not import from index files."
          }
        ]
      }
    ],
    // special rules for pure esm packages
    ...(packageJson.type === "module" ? {
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off"
    } : {})
  }
}, globalIgnores([
  // Exclude everywhere, even in sub folders
  "**/__downloaded__/",
  "**/__generated__/",
  // If a glob pattern starts with /, the pattern is relative to the base directory of the config file.
  "build/",
  "dist/",
  "target/"])
]);
