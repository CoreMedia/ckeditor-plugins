#!/usr/bin/env node
/**
 * Prints the pending changesets that request a major bump, one per line, as paths
 * relative to the repository root.
 *
 * Changesets are read by Changesets itself, so every valid frontmatter is recognized
 * (quotes, comments, …) and an unparsable changeset fails.
 *
 * Usage: node scripts/major-changesets.mjs
 */
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const rootDir = path.join(import.meta.dirname, "..");

// @changesets/read is a dependency of @changesets/cli, not of this workspace.
const cliPackageJson = createRequire(path.join(rootDir, "package.json")).resolve("@changesets/cli/package.json");
const readModule = createRequire(cliPackageJson).resolve("@changesets/read");
const { readChangesets } = await import(pathToFileURL(readModule).href);

for (const { id, releases } of await readChangesets(rootDir)) {
  if (releases.some(({ type }) => type === "major")) {
    console.log(`.changeset/${id}.md`);
  }
}
