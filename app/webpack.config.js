/**
 * @license Copyright (c) 2014-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

const path = require('path');
const webpack = require('webpack');
const {bundler, styles} = require('@ckeditor/ckeditor5-dev-utils');
const CKEditorWebpackPlugin = require('@ckeditor/ckeditor5-dev-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CircularDependencyPlugin = require("circular-dependency-plugin");

// WebPack 5+ Compatibility for clean-css (transitive dep. of html-minifier-terser)
// see also: https://webpack.js.org/configuration/resolve/#resolvefallback
/**
 * clean-css (transitive dep. of html-minifier-terser) requires some modules,
 * which are not shipped with WebPack 5+ anymore. As we don't use clean-css
 * as part of the `html-minifier-terser`, we can just ignore all requirements.
 *
 * @see https://webpack.js.org/configuration/resolve/#resolvefallback
 */
const cleanCssCompat = {
  fallback: {
    fs:  false,
    http: false,
    https: false,
    os: false,
    path: false,
    url: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      // Clean-CSS checks here, if this is equal to win32 for `isWindows`.
      "process.platform": JSON.stringify("unknown"),
    }),
  ],
};

module.exports = {
  devtool: 'eval-cheap-module-source-map',
  //devtool: 'source-map',
  performance: {hints: false},

  entry: path.resolve(__dirname, 'src', 'ckeditor.js'),

  resolve: {
    extensions: ['.js', '.json'],
    fallback: {
      ...cleanCssCompat.fallback,
    },
  },

  output: {
    // The name under which the editor will be exported.
    library: 'ClassicEditor',

    path: path.resolve(__dirname, 'dist'),
    filename: 'ckeditor.js',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },

  optimization: {
    minimizer: [
      new TerserWebpackPlugin({
        terserOptions: {
          output: {
            // Preserve CKEditor 5 license comments.
            comments: /^!/
          }
        },
        extractComments: false
      })
    ]
  },

  plugins: [
    ...cleanCssCompat.plugins,
    new CKEditorWebpackPlugin({
      // UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
      // When changing the built-in language, remember to also change it in the editor's configuration (src/ckeditor.js).
      language: 'en',
      additionalLanguages: ['de']
    }),
    new webpack.BannerPlugin({
      banner: bundler.getLicenseBanner(),
      raw: true
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
        use: ['raw-loader']
      },
      {
        test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              injectType: 'singletonStyleTag',
              attributes: {
                'data-cke': true
              }
            }
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: styles.getPostCssConfig({
                themeImporter: {
                  themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
                },
                minify: true
              })
            }
          },
        ]
      }
    ]
  }
};
