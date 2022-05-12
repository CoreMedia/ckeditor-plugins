const PlaywrightEnvironment = require('jest-playwright-preset/lib/PlaywrightEnvironment')
        .default
const pwConfig = require("./jest-playwright.config")
const fs = require("fs");
const fsPromises = require("fs").promises;

/**
 * Custom configuration:
 *
 * * Stores screenshot on failure
 * * renames recorded videos to more suitable names
 *
 * @see {@link https://www.ludeknovy.tech/blog/playwright-session-recoring-with-jest/ Playwright session recording with Jest Playwright and Jest circus - ludeknovy.tech}
 */
class CustomPlaywrightEnvironment extends PlaywrightEnvironment {
  async setup() {
    await super.setup()
    this.videos = [];
  }

  // noinspection JSUnusedGlobalSymbols
  async teardown() {
    // Your teardown
    await super.teardown()

    // Skipped, because it now fails on Windows with EBUSY (see below)
    // await Promise.all(this.videos.map(this.renameVideo));
  }

  async renameVideo(video) {
    const {recordVideo} = pwConfig.contextOptions;
    const exists = fs.existsSync(video.videoName)
    if (exists) {
      try {
        const newVideoName = `${recordVideo.dir}/${video.fullTestName}`;
        if (fs.existsSync(newVideoName)) {
          fs.rmSync(newVideoName);
        }
        // May fail with
        // Error: EBUSY: resource busy or locked, rename 'videos\55b917798d1406deb27976bcf3cf2829.webm' -> 'videos//HelloClassicEditor_should-drag-and-drop-image_chromium_failure.webm'
        // fs.renameSync(video.videoName, newVideoName);
        await fsPromises.rename(video.videoName, newVideoName);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    }
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Take screenshot on failure.
   */
  async handleTestEvent(event) {
    await super.handleTestEvent(event);
    const {name: eventName, test} = event;
    if (eventName !== "test_done") {
      return;
    }

    const {parent, name: testName, errors} = test;
    const {browserName} = this.context;
    const parentName = parent.name.replace(/\W/g, '-');
    const specName = testName.replace(/\W/g, '-');
    const success = errors.length === 0;
    const successId = success ? "success" : "failure";
    const fullTestName = `${parentName}_${specName}_${browserName}_${successId}`;

    if (!success) {
      await this.global.page.screenshot({
        path: `screenshots/${fullTestName}.png`,
      });
    }

    const videoName = await this.global.page.video().path();
    this.videos.push({fullTestName, videoName});
  }
}

module.exports = CustomPlaywrightEnvironment
