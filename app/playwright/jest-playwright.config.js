module.exports = {
  browsers: ["chromium"],
  launchOptions: {
    headless: false
  },
  contextOptions: {
    recordVideo: {
      dir: 'videos/'
    }
  }
};
