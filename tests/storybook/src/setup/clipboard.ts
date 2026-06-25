import type { ClipboardScenarioItem } from "../runtime/scenario";

/**
 * Writes a single item to the browser clipboard as part of preparing a
 * scenario. This is the in-page replacement for the former
 * `ClipboardBrowserAccessor.write` that Playwright tests previously performed
 * via `page.evaluate`: by writing during mount, a prepared story leaves the
 * clipboard ready and the test only needs to paste.
 *
 * `Blob` and `ClipboardItem` are browser-only globals, so this must run in the
 * Storybook runtime (browser), not in the Playwright (Node) process. The
 * `clipboard-write` permission must be granted on the browser context (the
 * Playwright config does so); otherwise the write rejects.
 *
 * @param item - the clipboard item (MIME type + content) to write
 */
export const writeClipboard = async (item: ClipboardScenarioItem): Promise<void> => {
  const blob = new Blob([item.content], { type: item.type });
  const clipboardItem = new ClipboardItem({ [item.type]: blob });
  await navigator.clipboard.write([clipboardItem]);

  // Fail early (so the scenario reports `data-editor-ready="error"`) if the
  // write silently produced nothing, mirroring the former accessor's read-back
  // verification.
  const written = await navigator.clipboard.read();
  if (written.length === 0) {
    throw new Error(`Failed to write prepared clipboard item of type ${item.type}.`);
  }
};
