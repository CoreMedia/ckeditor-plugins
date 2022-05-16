const PlaywrightEnvironment = require("jest-playwright-preset/lib/PlaywrightEnvironment").default;

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
    if (eventName !== "test_done") {
      return;
    }

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
  }
}

module.exports = CustomPlaywrightEnvironment;
