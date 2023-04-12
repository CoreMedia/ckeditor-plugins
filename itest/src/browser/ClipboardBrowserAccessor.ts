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
    return page.evaluate(async (itemToCopy): Promise<void> => {
      const requireClipboardPermission = async (
        name: "read" | "write",
        expectedState: PermissionState = "granted"
      ): Promise<void> => {
        const permissionName = `clipboard-${name}`;
        // @ts-expect-error - Bad typing for supported permission names.
        const permission = await navigator.permissions.query({ name: permissionName });
        if (permission.state !== expectedState) {
          throw Error(
            `Insufficient permission for ${permissionName}: expected: ${expectedState}, actual: ${permission.state}`
          );
        }
      };

      await requireClipboardPermission("write");

      // Blob and ClipboardItem are only available in the browser, therefore, we
      // have to create Blob and ClipboardItem in the same function where we write
      // it to the clipboard.
      const blob = new Blob([itemToCopy.content], { type: itemToCopy.type });
      const clipboardItem = new ClipboardItem({
        [itemToCopy.type]: blob,
      });
      try {
        await navigator.clipboard.write([clipboardItem]);
        console.debug("Triggered write to clipboard.", { ...itemToCopy });
      } catch (e) {
        console.debug("Failed writing to clipboard.", { ...itemToCopy }, e);
        throw e;
      }

      await requireClipboardPermission("read");

      // Some debugging/fail-early approach.
      const actualItemConfigs: ClipboardItemConfig[] = [];
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          for (const itemType of item.types) {
            const itemBlob = await item.getType(itemType);
            const itemText = await itemBlob.text();
            const actualConfig: ClipboardItemConfig = {
              type: itemType,
              content: itemText,
            };
            actualItemConfigs.push(actualConfig);
            console.debug("Actual item in clipboard:", actualConfig);
          }
        }
      } catch (e) {
        console.debug("Failed reading clipboard.", e);
      }

      if (actualItemConfigs.length === 0) {
        throw new Error(
          `Unexpected state: Clipboard (length: ${actualItemConfigs.length}) does not contain expected data, thus failed writing to clipboard: ${itemToCopy.type}: ${itemToCopy.content}`
        );
      }
    }, itemConfig);
  }
}
