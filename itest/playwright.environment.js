/*
 * To be able using JSDom, we must not use `.default` as documented, but
 * instead use `.getPlaywrightEnv("jsdom")`. This got introduced to
 * the environment, as some CKEditor classes directly invoke `navigator`
 * which again makes tests fail, if jsdom is not available.
 *
 * Requires `jest-environment-jsdom` dependency.`
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PlaywrightEnvironment = require("jest-playwright-preset/lib/PlaywrightEnvironment").getPlaywrightEnv("jsdom");

/**
 * Custom configuration:
 *
 * * Stores screenshot on failure
 */
class CustomPlaywrightEnvironment extends PlaywrightEnvironment {
  /**
   * Take screenshot on failure.
   */
  async handleTestEvent(event) {
    await super.handleTestEvent(event);
    const { name: eventName, test } = event;
    // Context may be undefined on early failure.
    if (eventName !== "test_done" || this.context === undefined) {
      return;
    }

    try {
      const { parent, name: testName, errors } = test;
      const { browserName } = this.context;
      const parentName = parent.name.replace(/\W/g, "-");
      const specName = testName.replace(/\W/g, "-");
      const success = errors.length === 0;
      const successId = success ? "success" : "failure";
      const fullTestName = `${parentName}_${specName}_${browserName}_${successId}`;

      if (!success) {
        // noinspection JSUnresolvedVariable,JSUnresolvedFunction
        await this.global.page.screenshot({
          path: `screenshots/${fullTestName}.png`,
        });
      }
    } catch (e) {
      // Fail-safe: We don't want to fail here, just because we cannot
      // take a screenshot.
      console.warn("Failed taking screenshot.", e);
    }
  }
}

module.exports = CustomPlaywrightEnvironment;
