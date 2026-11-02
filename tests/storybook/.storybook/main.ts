import { createStorybookConfig } from "@coremedia-internal/studio-client.storybook-config";
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

/**
 * Local framework pairing the HTML renderer with the webpack builder; see
 * `framework/preset.js`.
 */
const framework = path.join(currentDir, "framework");

const sharedConfig = createStorybookConfig({ framework });

/**
 * Query marking a style sheet import that should resolve to its source text
 * instead of being injected into the document, for example
 * `ckeditor5/ckeditor5.css?raw`. Used to adopt style sheets into shadow roots,
 * which page style sheets do not reach.
 */
const rawQuery = /raw/;

/**
 * Excludes `?raw` imports from the given (CSS) rule, so only the
 * `asset/source` rule handles them. Otherwise, the regular CSS loaders process
 * the import and the shadow root receives an empty style sheet.
 */
const excludeRawQuery = (rule: webpack.RuleSetRule): webpack.RuleSetRule =>
  rule.test instanceof RegExp && rule.test.test("style.css") && !rule.resourceQuery
    ? { ...rule, resourceQuery: { not: [rawQuery] } }
    : rule;

export default createStorybookConfig({
  framework,
  stories: ["../stories/**/*.stories.@(ts|mdx)"],
  // Extends the shared `webpackFinal` instead of replacing it, which would drop
  // its handling of `*.svg` imports as raw source, as CKEditor 5 icons require.
  webpackFinal: async (webpackConfig, options) => {
    const config = (await sharedConfig.webpackFinal?.(webpackConfig, options)) ?? webpackConfig;
    const rules = (config.module?.rules ?? []).map((rule) =>
      rule && typeof rule === "object" ? excludeRawQuery(rule) : rule,
    );
    config.module = {
      ...config.module,
      rules: [...rules, { test: /\.css$/, resourceQuery: rawQuery, type: "asset/source" }],
    };
    config.plugins = [
      ...(config.plugins ?? []),
      new webpack.DefinePlugin({
        CKEDITOR_LICENSE_KEY: JSON.stringify(process.env.CKEDITOR_LICENSE_KEY),
      }),
    ];
    return config;
  },
});
