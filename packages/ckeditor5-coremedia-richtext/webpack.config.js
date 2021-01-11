const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'src', 'CoreMediaRichText.ts'),
  output: {
    filename: 'cormedia-richtext.js',
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
