import { defineConfig } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import { configs as workspaceConfig } from "../../eslint.config.mjs";
import { dirname } from "path";
import { fileURLToPath } from "url";

export default defineConfig([
  ...workspaceConfig,
  {
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
        project: "./tsconfig.json",
      },
    },
  },
]);
