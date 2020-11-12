import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import PastePlainText from "./pasteplaintext";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_clipboard_clipboard-Clipboard.html">Class Clipboard (clipboard/clipboard~Clipboard) - CKEditor 5 API docs</a>
 */
// @ts-ignore: Fails for `requires`. TODO[cke]
export default class Clipboard extends Plugin {
  static readonly pluginName: "Clipboard";

  static readonly requires: [
    PastePlainText
  ];
}
