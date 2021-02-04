module.exports = {
  "plugins": [
    ["@babel/plugin-transform-typescript", {"allowDeclareFields": true, "allowNamespaces": true}],
    ["@babel/plugin-transform-parameters", {"loose": true}],
    ["@babel/plugin-transform-computed-properties", {"loose": true}],
    ["@babel/plugin-transform-shorthand-properties", {"loose": true}],
    ["@babel/plugin-transform-arrow-functions", {"spec": false}],
    ["@babel/plugin-transform-for-of", {"assumeArray": true}],
    ["@babel/plugin-proposal-class-properties", {}],
  ],
  "presets": [
    ["@babel/preset-env", {targets: {node: "current"}}],
    "@babel/preset-typescript",
  ]
};
