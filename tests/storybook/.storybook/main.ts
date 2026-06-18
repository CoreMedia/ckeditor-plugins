import type { StorybookConfig } from "@storybook/html-webpack5";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import webpack from "webpack";
import dotenv from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Walks up the directory tree from `startDir` to find the workspace root, i.e.
 * the first ancestor directory containing a `pnpm-workspace.yaml`.
 */
const findWorkspaceRoot = (startDir: string): string | undefined => {
  let dir = startDir;
  for (;;) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    const parentDir = path.dirname(dir);
    if (parentDir === dir) {
      return undefined;
    }
    dir = parentDir;
  }
};

/**
 * Resolves the `.env` file providing the `CKEDITOR_LICENSE_KEY`. Preference:
 * 1. a `.env` local to this Storybook package (copied from `app/.env`),
 * 2. the example application's `.env` (`app/.env`),
 * 3. a workspace-root `.env`.
 * Use `GPL` for the GNU GPL.
 */
const findEnvFile = (startDir: string): string | undefined => {
  const localEnv = path.join(startDir, "..", ".env");
  if (fs.existsSync(localEnv)) {
    return localEnv;
  }
  const workspaceRoot = findWorkspaceRoot(startDir);
  if (!workspaceRoot) {
    return undefined;
  }
  const candidates = [path.join(workspaceRoot, "app", ".env"), path.join(workspaceRoot, ".env")];
  return candidates.find((candidate) => fs.existsSync(candidate));
};

const envPath = findEnvFile(currentDir);
if (envPath) {
  dotenv.config({ path: envPath });
}

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|mdx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-webpack5-compiler-swc",
  ],
  framework: {
    name: "@storybook/html-webpack5",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  webpackFinal: (webpackConfig) => {
    webpackConfig.plugins = webpackConfig.plugins ?? [];
    webpackConfig.plugins.push(
      new webpack.DefinePlugin({
        CKEDITOR_LICENSE_KEY: JSON.stringify(process.env.CKEDITOR_LICENSE_KEY),
      }),
    );

    // CKEditor 5 imports `*.svg` icons as raw source strings. Storybook's
    // default asset handling resolves them to URLs, which breaks icon rendering
    // (`error-ui-iconview-invalid-svg`). Mirror the former application build
    // (`app/webpack.config.js`) and load SVGs as `asset/source`.
    const rules = webpackConfig.module?.rules ?? [];
    for (const rule of rules) {
      if (rule && typeof rule === "object" && "test" in rule && rule.test instanceof RegExp && rule.test.test(".svg")) {
        rule.exclude = /\.svg$/;
      }
    }
    rules.push({
      test: /\.svg$/,
      type: "asset/source",
    });
    if (webpackConfig.module) {
      webpackConfig.module.rules = rules;
    }

    return webpackConfig;
  },
};

export default config;
