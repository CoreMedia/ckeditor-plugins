#!/usr/bin/env node

/*
 * Deal with versions.
 *
 * If you need to pipe outputs (like current versions), ensure to invoke
 * pnpm with `--silent`, like:
 *
 * ```shell
 * pnpm --silent "script:version" --pull-request 128 --run-number 142
 * ```
 *
 * Examples, with alias `version` representing `pnpm --silent "script:version"`:
 *
 * ```shell
 * # Show current version
 * version
 *
 * # Also, show current version
 * version --current
 *
 * # Next Pre-Release for given Pull-Request and Run-Number
 * version --pull-request 142 --run-number 837
 *
 * # Next Release - for different types
 * version --release patch
 * version --release minor
 * version --release major
 *
 * # --write to update .release-version with evaluated version (also outputs
 * # version).
 * version --release patch --write
 * ```
 */

import minimist from 'minimist';
import fs from "node:fs/promises";
import semver from "semver";

const cliArguments = process.argv.slice(2);

// Default to show current, if no arguments are given.
let current = cliArguments.length === 0;

const argv = minimist(cliArguments, {
  boolean: [
    "help",
    "current",
    "release-candidate",
    "write",
  ],
  string: [
    "pull-request",
    "release",
    "run-number",
  ],
  alias: {
    "help": ["h", "?"],
    "pull-request": "p",
    "run-number": "n",
    "release": "r",
    "release-candidate": "c",
    "write": "w",
  },
  unknown: (unknownArg) => {
    // Don't fail for non-options.
    if (unknownArg.startsWith("-")) {
      console.error(`Unknown argument ${unknownArg} passed to "version"!"`);
      process.exit(1);
    }
  }
});

const {
  help = false,
  current: currentArg = false,
  "pull-request": pullRequest = "",
  "run-number": runNumber = "",
  release = "",
  "release-candidate": releaseCandidate = false,
  write,
  _: extraArgs,
} = argv;

if (help) {
  console.log(`Show current or increased version

Usage:

  version [--help|-h|-?] [--current]
    [--pull-request|-p <number>] [--run-number|-n <number>]
    [--release|-r <major|minor|patch>]
    [--release-candidate|-c]
    [--write|-w]
`);
  process.exit(0);
}

// Either show current on no-arg or if --current is given.
current = current || currentArg;

if (extraArgs.length > 0) {
  console.error(`Unknown arguments given: ${extraArgs.join(" ")}. Use --help for usage information.`);
  process.exit(1);
}

const releaseVersionFile = ".release-version";

const getCurrent = async () => {
  try {
    return await fs.readFile(releaseVersionFile, { encoding: "utf8" });
  } catch (e) {
    console.error(`Failed reading file "${releaseVersionFile}".`, e);
    process.exit(2);
  }
  // Unreachable, but helps typing support.
  return "";
};

const getNextForPullRequest = async (pullRequest, runNumber) => {
  if (!pullRequest) {
    console.error("run-number requires pull-request to be set!");
    process.exit(1);
  }
  if (!runNumber) {
    console.error("pull-request requires run-number to be set!");
    process.exit(1);
  }

  // See <https://semver.org/> (pre-release specification, <https://semver.org/#spec-item-9>)
  // Identifier pattern: [0-9A-Za-z-]
  const preReleaseIdentifier = `pr${pullRequest}-${runNumber}`;
  const currentVersion = await getCurrent();
  return semver.inc(currentVersion, "prerelease", preReleaseIdentifier);
};

const getNextForReleaseCandidate = async () => {
  const currentVersion = await getCurrent();
  const releaseCandidateIdentifier = "rc";
  return semver.inc(currentVersion, "prerelease", releaseCandidateIdentifier);
};

const getNextForRelease = async (releaseType) => {
  const normalizedType = releaseType.toLowerCase();
  if (!["major", "minor", "patch"].includes(normalizedType)) {
    console.error(`Release type must be one of major, minor, or patch, but is: ${releaseType}`);
    process.exit(1);
  }
  const currentVersion = await getCurrent();
  return semver.inc(currentVersion, normalizedType);
};

const writeVersion = async (version) => {
  try {
    await fs.writeFile(releaseVersionFile, `${version}\n`);
  } catch (e) {
    console.error(`Failed updating file "${releaseVersionFile}" to version ${version}.`, e);
    process.exit(3);
  }
};

let nextVersion = "";

// We may check, that only one flag is set at a time. For now, we assume it is
// enough to define some priority, which flag wins over the others to determine
// the version.

if (current) {
  nextVersion = await getCurrent();
}

if (pullRequest || runNumber) {
  nextVersion = await getNextForPullRequest(pullRequest, runNumber);
}

if (releaseCandidate) {
  nextVersion = await getNextForReleaseCandidate();
}

if (release) {
  nextVersion = await getNextForRelease(release);
}

console.log(nextVersion);

if (write) {
  await writeVersion(nextVersion);
}
