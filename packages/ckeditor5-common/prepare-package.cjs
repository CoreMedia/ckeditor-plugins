#! /usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const distPath = path.resolve("dist");
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}

const packageJson = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8"));
if (typeof packageJson.publishConfig === "object") {
  delete packageJson.publishConfig.directory;
  delete packageJson.publishConfig.linkDirectory;
  Object.assign(packageJson, packageJson.publishConfig);
  delete packageJson.publishConfig;
  delete packageJson.scripts;
  delete packageJson.devDependencies;
}
fs.writeFileSync(path.resolve("dist/package.json"), JSON.stringify(packageJson, null, 2) + "\n");
