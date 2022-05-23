/**
 * Reference this local configuration for _headed_/_headful_ test runs.
 * This is implicitly done by running:
 *
 * ```
 * jest --config ./jest.local.js
 * ```
 *
 * .gitignore: This file is by default ignored. To commit changes, ensure
 * to add with `--force` flag.
 *
 * Some options below are placed in comments when it comes to their usages.
 * It shall provide some ideas, which options you may want to enable. To
 * do so, just remove the corresponding comments.
 */
const base = require("./jest-playwright.config.js");

/**
 * Run tests in headed mode.
 */
const headless = false;

/**
 * Open Chromium DevTools; enforces headless: `false`.
 */
const devtools = true;

/**
 * Run tests in slow motion.
 */
const slowMo = 20;

/**
 * Launch options for local run.
 *
 * Remove comments for those features, you want to activate.
 */
const launchOptions = {
  ...base.launchOptions,
  headless,
  // devtools,
  // slowMo,
};

/**
 * Enables recording videos. `videos/` folder is ignored
 * in `.gitignore`.
 */
const recordVideo = {
  dir: "videos/",
};

/**
 * Context options for local run.
 *
 * Remove comments for those features, you want to activate.
 */
const contextOptions = {
  ...base.contextOptions,
  // recordVideo,
};

module.exports = {
  ...base,
  launchOptions,
  contextOptions,
};
