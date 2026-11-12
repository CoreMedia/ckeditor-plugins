#!/usr/bin/env node
/**
 * Assembles the notes of the single GitHub release `vX.Y.Z` from the `## X.Y.Z`
 * sections of all package changelogs written by Changesets.
 *
 * Packages whose section only lists dependency updates are skipped: in the fixed
 * versioning group every package is bumped, but most of them without own changes.
 *
 * Usage: node scripts/release-notes.mjs <version> [packages-dir]
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const [version, packagesDirArg] = process.argv.slice(2);
if (!version) {
  console.error("Usage: node scripts/release-notes.mjs <version> [packages-dir]");
  process.exit(1);
}
const packagesDir = path.resolve(packagesDirArg ?? path.join(import.meta.dirname, "..", "packages"));

/** Returns the body of the `## <version>` section, or an empty string. */
const extractSection = (changelog, wantedVersion) => {
  const lines = changelog.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${wantedVersion}`);
  if (start < 0) {
    return "";
  }
  const end = lines.findIndex((line, index) => index > start && /^##\s/.test(line));
  return lines.slice(start + 1, end < 0 ? undefined : end).join("\n");
};

/**
 * Changesets lists dependency updates either as "- Updated dependencies [hash]" with a
 * nested list, or, without a related commit, as bare "- name@version" entries.
 */
const isDependencyUpdate = (entry) =>
  /^- Updated dependencies\b/.test(entry[0]) ||
  entry.filter((line) => line.trim() !== "").every((line) => /^\s*- \S+@\d\S*$/.test(line));

/**
 * Removes dependency update entries (including their nested list) and drops `###`
 * subsections that end up empty.
 */
const withoutDependencyUpdates = (section) => {
  const subsections = [];
  let current = { heading: undefined, entries: [] };
  for (const line of section.split("\n")) {
    if (/^###\s/.test(line)) {
      subsections.push(current);
      current = { heading: line, entries: [] };
    } else if (/^- /.test(line)) {
      current.entries.push([line]);
    } else if (current.entries.length > 0) {
      current.entries.at(-1).push(line);
    }
  }
  subsections.push(current);

  return subsections
    .map(({ heading, entries }) => ({
      heading,
      entries: entries
        .filter((entry) => !isDependencyUpdate(entry))
        .map((entry) => entry.join("\n").trimEnd()),
    }))
    .filter(({ entries }) => entries.length > 0)
    .map(({ heading, entries }) => [heading, entries.join("\n\n")].filter(Boolean).join("\n\n"))
    .join("\n\n");
};

const directories = (await readdir(packagesDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const sections = [];
for (const directory of directories) {
  let changelog;
  try {
    changelog = await readFile(path.join(packagesDir, directory, "CHANGELOG.md"), "utf8");
  } catch {
    continue;
  }
  const { name } = JSON.parse(await readFile(path.join(packagesDir, directory, "package.json"), "utf8"));
  const notes = withoutDependencyUpdates(extractSection(changelog, version));
  if (notes) {
    sections.push(`## ${name}\n\n${notes}`);
  }
}

process.stdout.write(
  sections.length > 0 ? `${sections.join("\n\n")}\n` : "No changes besides dependency updates.\n",
);
