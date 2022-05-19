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
  headless: false,
};

module.exports = {
  ...base,
  launchOptions,
};
