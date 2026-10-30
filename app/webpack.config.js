/* eslint-env node */

import path from "path";
import webpack from "webpack";
import { Features } from "lightningcss";
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
      // Replaces raw-loader (deprecated, broken with ajv@8) with webpack 5 built-in asset/source
      {
        test: /\.svg$/,
        type: "asset/source",
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
            options: {
              injectType: "singletonStyleTag",
              attributes: { "data-cke": true },
            },
          },
          {
            loader: "css-loader",
            options: { importLoaders: 1 },
          },
          {
            loader: path.resolve(dirname, "lightningcss-loader.js"),
            options: {
              lightningCssOptions: { minify: true, include: Features.Nesting },
            },
          },
        ],
      },
      {
        test: /\.ts$/,
        loader: "esbuild-loader",
        options: {
          target: "es2022",
          tsconfig: path.resolve(dirname, "tsconfig.json"),
        },
      },
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
