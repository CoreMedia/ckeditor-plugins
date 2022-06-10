export default class WindowWrapper {
  static async getUserAgent(): Promise<string> {
    return page.evaluate(() => {
      return window.navigator.userAgent;
    });
  }
}
