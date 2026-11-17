#!/usr/bin/env node
/**
 * Assembles the notes of the single GitHub release `vX.Y.Z` from the `## X.Y.Z`
 * sections of all package changelogs written by Changesets.
 *
 * Entries are grouped by change type and deduplicated by changeset hash because a
 * changeset affecting multiple packages appears in each package's changelog.
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

const changeTypes = ["Major", "Minor", "Patch"];
const entriesByChangeType = Object.fromEntries(changeTypes.map((type) => [type, []]));
const seenChangesetHashes = new Set();

const collectChangeEntries = (section) => {
  let changeType;
  let currentEntry;
  const flushEntry = () => {
    if (!currentEntry) {
      return;
    }
    if (!isDependencyUpdate(currentEntry)) {
      const hash = currentEntry[0].match(/^- ([a-f0-9]{7,40}):/i)?.[1].toLowerCase();
      if (!hash || !seenChangesetHashes.has(hash)) {
        entriesByChangeType[changeType].push(currentEntry.join("\n").trimEnd());
        if (hash) {
          seenChangesetHashes.add(hash);
        }
      }
    }
    currentEntry = undefined;
  };

  for (const line of section.split("\n")) {
    if (/^###\s/.test(line)) {
      flushEntry();
      const heading = line.match(/^### (Major|Minor|Patch) Changes$/);
      changeType = heading?.[1];
    } else if (changeType && /^- /.test(line)) {
      flushEntry();
      currentEntry = [line];
    } else if (currentEntry) {
      currentEntry.push(line);
    }
  }
  flushEntry();
};

const directories = (await readdir(packagesDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const directory of directories) {
  let changelog;
  try {
    changelog = await readFile(path.join(packagesDir, directory, "CHANGELOG.md"), "utf8");
  } catch {
    continue;
  }
  collectChangeEntries(extractSection(changelog, version));
}

const sections = changeTypes
  .filter((type) => entriesByChangeType[type].length > 0)
  .map((type) => `### ${type} Changes\n\n${entriesByChangeType[type].join("\n\n")}`);

process.stdout.write(sections.length > 0 ? `${sections.join("\n\n")}\n` : "No changes besides dependency updates.\n");
