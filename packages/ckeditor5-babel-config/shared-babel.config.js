module.exports = {
  plugins: [
    [require.resolve("@babel/plugin-proposal-class-properties"), {}],
    [require.resolve("@babel/plugin-proposal-private-methods"), {}],
    [require.resolve("@babel/plugin-transform-arrow-functions"), { spec: false }],
    [require.resolve("@babel/plugin-transform-classes"), {}],
    [require.resolve("@babel/plugin-transform-computed-properties"), { loose: true }],
    [require.resolve("@babel/plugin-transform-for-of"), { assumeArray: true }],
    [require.resolve("@babel/plugin-transform-parameters"), { loose: true }],
    [require.resolve("@babel/plugin-transform-shorthand-properties"), { loose: true }],
    [require.resolve("@babel/plugin-transform-typescript"), { allowDeclareFields: true, allowNamespaces: true }],
  ],
  presets: [
    [
      require.resolve("@babel/preset-env"),
      {
        targets: {
          node: "current",
        },
      },
      require.resolve("@babel/preset-typescript"),
    ],
  ],
};
