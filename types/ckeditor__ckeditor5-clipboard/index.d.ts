// Type definitions for @ckeditor/ckeditor5-clipboard
// Project: https://github.com/ckeditor/ckeditor5
// TypeScript Version: 2.3

import * as core from "@ckeditor/ckeditor5-core";
import * as engine from "@ckeditor/ckeditor5-engine";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_clipboard_clipboard-Clipboard.html">Class Clipboard (clipboard/clipboard~Clipboard) - CKEditor 5 API docs</a>
 */
// @ts-ignore: Fails for `requires`. TODO[cke]
export class Clipboard extends core.Plugin {
  static readonly pluginName: "Clipboard";

  static readonly requires: [
    PastePlainText
  ];
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_clipboard_clipboardobserver-ClipboardEventData.html">Class ClipboardEventData (clipboard/clipboardobserver~ClipboardEventData) - CKEditor 5 API docs</a>
 */
export class ClipboardEventData extends engine.view.observer.DomEventData {
  readonly dataTransfer: DataTransfer;
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_clipboard_datatransfer-DataTransfer.html">Class DataTransfer (clipboard/datatransfer~DataTransfer) - CKEditor 5 API docs</a>
 */
export class DataTransfer {
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_clipboard_clipboard-PastePlainText.html">Class PastePlainText (clipboard/clipboard~PastePlainText) - CKEditor 5 API docs</a>
 */
export class PastePlainText extends core.Plugin {
  static readonly pluginName: "PastePlainText";
}
