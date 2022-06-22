export default class WindowBrowserAccessor {
  static async getUserAgent(): Promise<string> {
    return page.evaluate(() => {
      return window.navigator.userAgent;
    });
  }
}
