/**
 * Accesses the window object inside the currently running browser instance.
 */
export default class WindowBrowserAccessor {
  /**
   * Gets the <i>userAgent</i> from the browser.
   */
  static async getUserAgent(): Promise<string> {
    return page.evaluate(() => {
      return window.navigator.userAgent;
    });
  }
}
