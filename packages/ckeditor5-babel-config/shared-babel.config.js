module.exports = {
  "plugins": [
    [require.resolve("@babel/plugin-transform-typescript"), {"allowDeclareFields": true, "allowNamespaces": true}],
    [require.resolve("@babel/plugin-transform-parameters"), {"loose": true}],
    [require.resolve("@babel/plugin-transform-computed-properties"), {"loose": true}],
    [require.resolve("@babel/plugin-transform-shorthand-properties"), {"loose": true}],
    [require.resolve("@babel/plugin-transform-arrow-functions"), {"spec": false}],
    [require.resolve("@babel/plugin-transform-for-of"), {"assumeArray": true}],
    [require.resolve("@babel/plugin-proposal-class-properties"), {}],
  ],
  "presets": [[require.resolve("@babel/preset-env"), {
    "targets": {
      "node": 12
    }
  }]]
};
