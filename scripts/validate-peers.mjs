#!/usr/bin/env node

import validatePeerDependencies from "validate-peer-dependencies";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Get all direct descendents of a given directory as full path.
 * @param source - directory to scan
 * @returns {Promise<string[]>} - full paths of directories that are a direct
 * descendent of the given directory
 */
const getDirectories = async (source) =>
  (await fs.readdir(source, { withFileTypes: true, encoding: "utf8" }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(dirent.path, dirent.name));

/**
 * Reports an observed failure to console.
 *
 * @param result - Result object of validatePeerDependencies
 * @see <https://github.com/rwjblue/validate-peer-dependencies>
 */
const reportFailure = (result) => {
  const { packagePath, incompatibleRanges, missingPeerDependencies } = result;
  console.error(`${packagePath}:`);
  if (missingPeerDependencies?.length ?? 0 > 0) {
    const descriptors = missingPeerDependencies.map(
      ({ name, specifiedPeerDependencyRange }) => `${name}:${specifiedPeerDependencyRange}`,
    );
    console.error(`  Missing peerDependencies (${missingPeerDependencies.length}):`);
    descriptors.forEach((descriptor) => console.error(`    * ${descriptor}`));
  }
  if (incompatibleRanges?.length ?? 0 > 0) {
    const descriptors = incompatibleRanges.map(
      ({ name, specifiedPeerDependencyRange, version }) => `${name}:${specifiedPeerDependencyRange} (is: ${version})`,
    );
    console.error(`  Incompatible peerDependencies (${incompatibleRanges.length}):`);
    descriptors.forEach((descriptor) => console.error(`    * ${descriptor}`));
  }
};

/**
 * Validates if the `package.json` in given (or: nearest) directory has
 * issues regarding its `peerDependencies`.
 *
 * @param dirName - directory name to start scanning
 * @returns {boolean} - `false` if there are no issues, `true` if there are
 * issues, that got reported to console
 */
const hasPeerDependencyIssues = (dirName) => {
  let hasFailure = false;
  const handleFailure = (result) => {
    hasFailure = true;
    reportFailure(result);
  };
  validatePeerDependencies(dirName, { handleFailure });
  return hasFailure;
};

// Iterates through all `package.json` in `packages/` to scan for issues
// regarding peerDependencies.
void getDirectories("packages").then((dirs) => {
  const packageJsonWithIssues = dirs.map((path) => hasPeerDependencyIssues(path)).filter(Boolean);

  if (packageJsonWithIssues.length !== 0) {
    console.error(`Detected violated peerDependencies: ${packageJsonWithIssues.length})`);
    process.exit(1);
  } else {
    console.info("No peerDependencies violations detected.");
  }
});
