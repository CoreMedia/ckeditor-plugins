"use strict";

/* eslint-env node */

const path = require("path");
const webpack = require("webpack");
const { bundler, loaders } = require("@ckeditor/ckeditor5-dev-utils");
const { CKEditorTranslationsPlugin } = require("@ckeditor/ckeditor5-dev-translations");
const TerserPlugin = require("terser-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");

module.exports = {
  devtool: "source-map",
  performance: { hints: false },

  entry: path.resolve(__dirname, "src", "index.ts"),

  output: {
    // The name under which the editor will be exported.
    library: "ClassicEditor",

    path: path.resolve(__dirname, "dist"),
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
        themePath: require.resolve("@ckeditor/ckeditor5-theme-lark/dist/index.css"),
        minify: true,
      }),
      loaders.getTypeScriptLoader(),
    ],
  },

  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
};
