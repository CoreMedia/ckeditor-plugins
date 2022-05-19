/*
 * Reference this local configuration for _headed_/_headful_ test runs.
 * This is implicitly done by running:
 *
 * ```
 * jest --config ./jest.local.js
 * ```
 *
 * .gitignore: This file is by default ignored. To commit changes, ensure
 * to add with `--force` flag.
 */
const base = require("./jest-playwright.config.js");

/*
 * Configure for headed mode in local setup.
 */
const launchOptions = {
  ...base.launchOptions,
  // Run in headed mode.
  headless: false,
  // Open Chromium DevTools; enforces headless: false
  // devtools: true,
  // Run in slow motion:
  // slowMo: 20,
};

module.exports = {
  ...base,
  launchOptions,
};
