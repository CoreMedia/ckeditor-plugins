/*
 * This is the default configuration used especially in CI.
 * For local run see `jest-playwright.local.js` and corresponding
 * `jest.local.js`.
 */
module.exports = {
  browsers: ["chromium"],
  launchOptions: {
    headless: true,
  },
};
