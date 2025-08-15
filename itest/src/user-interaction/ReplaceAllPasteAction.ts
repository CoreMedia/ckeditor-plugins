import WindowBrowserAccessor from "../browser/WindowBrowserAccessor";

/**
 * An action which selects the content of the currently focused dom element and
 * replaces everything by pasting from the clipboard.
 *
 * The action is using keyboard shortcuts to select everything and paste.
 * Select and paste is supported for Linux, Mac and Windows.
 */

export default class ReplaceAllPasteAction {
  /**
   * Selects all (ctrl + a) in the currently focused dom element and triggers
   * a paste (ctrl + v) from the clipboard.
   * Respects that Mac uses cmd + a and cmd + v for select all and paste.
   */
  static async execute(): Promise<void> {
    const userAgent = await WindowBrowserAccessor.getUserAgent();
    const { keyboard } = page;
    const metaKey = userAgent.includes("Mac") ? "Meta" : "Control";
    const press = (key: string): Promise<unknown> => Promise.all([keyboard.down(key), keyboard.up(key)]);
    const selectAllAndPaste = (metaKey: "Control" | "Meta"): Promise<unknown> =>
      Promise.all([keyboard.down(metaKey), press("a"), press("v"), keyboard.up(metaKey)]);

    await selectAllAndPaste(metaKey);
    console.debug(`ReplaceAllPasteAction: Processed ${metaKey}+A, ${metaKey}+V (for ${userAgent})`);
  }
}
