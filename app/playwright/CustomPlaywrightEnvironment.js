const PlaywrightEnvironment = require('jest-playwright-preset/lib/PlaywrightEnvironment')
        .default

class CustomPlaywrightEnvironment extends PlaywrightEnvironment {
  async setup() {
    await super.setup()
    // Your setup
  }

  // noinspection JSUnusedGlobalSymbols
  async teardown() {
    // Your teardown
    await super.teardown()
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Take screenshot on failure.
   */
  async handleTestEvent(event) {
    await super.handleTestEvent(event);
    if (event.name === 'test_done' && event.test.errors.length > 0) {
      const parentName = event.test.parent.name.replace(/\W/g, '-');
      const specName = event.test.name.replace(/\W/g, '-');
      const { browserName } = this.context;
      await this.global.page.screenshot({
        path: `screenshots/${parentName}_${specName}_${browserName}.png`,
      });
    }
  }
}

module.exports = CustomPlaywrightEnvironment
