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
import path from "node:path";
import { readChangesets } from "@changesets/read";

const rootDir = path.join(import.meta.dirname, "..");

for (const { id, releases } of await readChangesets(rootDir)) {
  if (releases.some(({ type }) => type === "major")) {
    console.log(`.changeset/${id}.md`);
  }
}
