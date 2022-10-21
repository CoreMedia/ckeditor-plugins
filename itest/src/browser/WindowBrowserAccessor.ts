/**
 * Accesses the window object inside the currently running browser instance.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class WindowBrowserAccessor {
  /**
   * Gets the <i>userAgent</i> from the browser.
   */
  static async getUserAgent(): Promise<string> {
    return page.evaluate(() => window.navigator.userAgent);
  }
}
