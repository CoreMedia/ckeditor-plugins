import path from "path";

module.exports = {
  entry: path.resolve(__dirname, "src", "index.ts"),
  output: {
    filename: "dataprocessor-support.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
