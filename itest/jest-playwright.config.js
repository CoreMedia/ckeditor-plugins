/**
 * Browsers to run in CI.
 */
const browsers = ["chromium"];

/**
 * In CI we want to run tests in headless mode.
 */
const headless = true;

/**
 * Launch options for CI run, which is running headless.
 */
const launchOptions = {
  headless,
};
/**
 * These are meant to be possibly extended for local runs.
 */
const contextOptions = {
  permissions: ["clipboard-read", "clipboard-write"],
};

/**
 * This is the default configuration used especially in CI.
 * For local run see `jest-playwright.local.js` and corresponding
 * `jest.local.js`.
 */
module.exports = {
  browsers,
  launchOptions,
  contextOptions,
};
