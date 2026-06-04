#!/usr/bin/env node

/*
 * Check availability of all published (non-private) packages in the
 * `packages` folder against the CoreMedia Nexus npm proxy.
 *
 * The proxy transparently retrieves missing packages from the main registry,
 * so requesting them here is also a convenient way to "warm up" the proxy.
 *
 * Usage:
 *
 * ```shell
 * node ./scripts/check-published-packages.mjs
 * ```
 *
 * The Nexus host uses an internal/self-signed certificate, so TLS verification
 * is disabled by default. Pass `--secure` (or set INSECURE=0) to enforce it:
 *
 * ```shell
 * node ./scripts/check-published-packages.mjs --secure
 * ```
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// --- Configuration ----------------------------------------------------------

// Nexus proxy registry. It pulls packages from the main registry on demand.
const REGISTRY = "https://nexus.venus-ci-01.coremedia.vm/repository/coremedia-npm/";

// Concrete version checked for all @coremedia ckeditor5 packages.
const VERSION = "26.0.1-pr249-1298.0";

// The Nexus host typically serves a self-signed/internal certificate that Node
// rejects by default (resulting in an opaque "fetch failed"). Browsers trust
// the internal CA or let you click through; Node does neither. Disable TLS
// verification unless `--secure` / INSECURE=0 is given.
const secure = process.argv.includes("--secure") || process.env.INSECURE === "0";
if (!secure) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagesDir = path.resolve(__dirname, "..", "packages");

// --- Collect published packages ---------------------------------------------

/**
 * Reads every `packages/<dir>/package.json` and returns the names of all
 * non-private (i.e. published) packages.
 *
 * @param {string} dir absolute path to the `packages` folder
 * @returns {Promise<string[]>} sorted list of published package names
 */
const collectPublishedPackages = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const names = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const pkgJsonPath = path.join(dir, entry.name, "package.json");
    let raw;
    try {
      raw = await fs.readFile(pkgJsonPath, "utf8");
    } catch {
      // No package.json in this folder, skip it.
      continue;
    }

    const pkg = JSON.parse(raw);

    // Skip private packages, they are never published.
    if (pkg.private === true) {
      continue;
    }

    if (typeof pkg.name === "string" && pkg.name.length > 0) {
      names.push(pkg.name);
    }
  }

  return names.sort();
};

// Variable holding all published packages to check.
const PACKAGES = await collectPublishedPackages(packagesDir);

// --- Check packages against the registry ------------------------------------

/**
 * Builds the npm "packument" URL (all metadata for a package).
 *
 * @param {string} registry registry base URL
 * @param {string} name (scoped) package name
 * @returns {string} URL to the package metadata document
 */
const buildPackumentUrl = (registry, name) => {
  const base = registry.endsWith("/") ? registry : `${registry}/`;
  return `${base}${name}`;
};

/**
 * Checks whether a specific version of a package is available on the registry.
 *
 * @param {string} name (scoped) package name
 * @returns {Promise<{status: "OK" | "MISSING" | "FAIL" | "ERROR", detail: string, url: string}>}
 */
const checkPackage = async (name) => {
  const url = buildPackumentUrl(REGISTRY, name);
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      return { status: "FAIL", detail: `HTTP ${response.status}`, url };
    }
    const doc = await response.json();
    const versions = doc?.versions ?? {};
    if (Object.prototype.hasOwnProperty.call(versions, VERSION)) {
      const tarball = versions[VERSION]?.dist?.tarball ?? "(no tarball url)";
      return { status: "OK", detail: tarball, url };
    }
    return { status: "MISSING", detail: `version ${VERSION} not published`, url };
  } catch (error) {
    return { status: "ERROR", detail: error.message, url };
  }
};

console.log(`Checking ${PACKAGES.length} published package(s) at version ${VERSION}`);
console.log(`Registry: ${REGISTRY}`);
console.log(`TLS verification: ${secure ? "enabled" : "disabled (self-signed host)"}`);
console.log("");

let available = 0;

for (const name of PACKAGES) {
  const { status, detail, url } = await checkPackage(name);
  if (status === "OK") {
    available++;
    console.log(`OK      ${name}@${VERSION} -> ${detail}`);
  } else {
    console.log(`${status.padEnd(7)} ${name}@${VERSION} (${detail}) -> ${url}`);
  }
}

console.log("");
console.log(`Done. ${available}/${PACKAGES.length} package(s) available at version ${VERSION}.`);

if (available !== PACKAGES.length) {
  process.exitCode = 1;
}

