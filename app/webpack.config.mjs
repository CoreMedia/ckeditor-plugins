"use strict";

/* eslint-env node */

const { default: path } = await import("path");
const { default: webpack } = await import("webpack");
const { bundler, loaders } = await import("@ckeditor/ckeditor5-dev-utils");
const { CKEditorTranslationsPlugin } = await import("@ckeditor/ckeditor5-dev-translations");
const { default: TerserPlugin } = await import("terser-webpack-plugin");
const { default: CircularDependencyPlugin } = await import("circular-dependency-plugin");
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default {
  devtool: "source-map",
  performance: { hints: false },

  entry: path.resolve(dirname, "src", "index.ts"),

  output: {
    // The name under which the editor will be exported.
    library: "ClassicEditor",

    path: path.resolve(dirname, "dist"),
    filename: "ckeditor.js",
    libraryTarget: "umd",
    libraryExport: "default",
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          sourceMap: true,
        },
        extractComments: false,
      }),
    ],
  },

  plugins: [
    new CKEditorTranslationsPlugin({
      // UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
      // When changing the built-in language, remember to also change it in the editor's configuration (src/ckeditor.js).
      language: "en",
      additionalLanguages: ["de"],
      sourceFilesPattern: "[/\\]ckeditor5/translations/[a-z]{2}.js",
    }),
    new webpack.BannerPlugin({
      banner: bundler.getLicenseBanner(),
      raw: true,
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
    }),
  ],

  module: {
    rules: [
      loaders.getIconsLoader({ matchExtensionOnly: true }),
      loaders.getStylesLoader({
        themePath: import.meta.resolve("@ckeditor/ckeditor5-theme-lark"),
        minify: true,
      }),
      loaders.getTypeScriptLoader(),
    ],
  },

  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
};
