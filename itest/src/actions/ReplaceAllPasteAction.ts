import WindowWrapper from "../browser/WindowWrapper";
/**
 * An action which selects the content of the currently focused dom element and
 * replaces everything by pasting from the clipboard.
 *
 * The action is using keyboard shortcuts to select everything and paste.
 * Select and paste is supported for Linux, Max and Windows.
 */
export default class ReplaceAllPasteAction {
  /**
   * Selects all (ctrl + a) in the currently focused dom element and triggers
   * a paste (ctrl + v) from the clipboard.
   * Respects that Mac uses cmd + a and cmd + v for select all and paste.
   */
  static async execute(): Promise<void> {
    const userAgent = await WindowWrapper.getUserAgent();
    if (userAgent.indexOf("Mac") === -1) {
      await page.keyboard.down("Control");
      await page.keyboard.press("a");
      await page.keyboard.press("v");
      await page.keyboard.up("Control");
    } else {
      await page.keyboard.down("Meta");
      await page.keyboard.press("a");
      await page.keyboard.press("v");
      await page.keyboard.up("Meta");
    }
  }
}
