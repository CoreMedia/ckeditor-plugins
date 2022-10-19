export interface ClipboardItemConfig {
  type: string;
  content: string;
}
/**
 * Accessor for the Clipboard Web-API {@link https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API}.
 *
 * Requires granted rights <i>clipboard-read</i> and <i>clipboard-write</i>
 * inside the used browser instance.
 *
 *
 * Caution:
 *
 * Using the Clipboard might cause flaky tests as the system clipboard is used.
 * Therefore, tests accessing clipboard must not run parallel.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class ClipboardBrowserAccessor {
  /**
   * Writes the given itemConfig to the Clipboard of the browser.
   *
   * Currently, it is only supported to write one item. The Clipboard Web-API
   * supports to write multiple items.
   *
   * @param itemConfig - the item config to create the item from.
   */
  static async write(itemConfig: ClipboardItemConfig): Promise<void> {
    return page.evaluate((itemToCopy): void => {
      //Blob and ClipboardItem are only available in the browser, therefore we
      //have to create Blob and ClipboardItem in the same function where we write
      //it to the clipboard.
      const blob = new Blob([itemToCopy.content], { type: itemToCopy.type });
      const clipboardItem = new ClipboardItem({
        [itemToCopy.type]: blob,
      });
      navigator.clipboard.write([clipboardItem]);
    }, itemConfig);
  }
}
