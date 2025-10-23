/* eslint-env node */

import path from "path";
import webpack from "webpack";
import { bundler, loaders } from "@ckeditor/ckeditor5-dev-utils";
import { CKEditorTranslationsPlugin } from "@ckeditor/ckeditor5-dev-translations";
import TerserPlugin from "terser-webpack-plugin";
import CircularDependencyPlugin from "circular-dependency-plugin";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function findEnvFile(startDir = dirname) {
  let dir = startDir;
  let nothingFound = false;
  while (!nothingFound) {
    const envPath = path.join(dir, ".env");
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    const parentDir = path.dirname(dir);
    if (parentDir === dir) {
      nothingFound = true;
    }
    dir = parentDir;
  }
  return undefined;
}

const envPath = findEnvFile();

if (!envPath) {
  console.log("No .env file found in the project directory or its parents.", import.meta.dirname);
} else {
  console.log("Using .env file:", envPath);
}

dotenv.config({ path: envPath });

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
    new webpack.DefinePlugin({
      CKEDITOR_LICENSE_KEY: JSON.stringify(process.env.CKEDITOR_LICENSE_KEY),
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
      {
        test: /\.m?js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },

  resolve: {
    extensions: [".ts", ".js", ".json"],
    extensionAlias: {
      ".js": [".js", ".ts"],
    },
    fullySpecified: false,
  },
};
