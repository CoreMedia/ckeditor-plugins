const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'src', 'CMRichTextDataProcessor.ts'),
  output: {
    filename: 'cm-richtext-dataprocessor.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
