import ClipboardEventData from "@ckeditor/ckeditor5-clipboard/src/clipboardobserver";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin"
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_paste-from-office_pastefromoffice-PasteFromOffice.html">Class PasteFromOffice (paste-from-office/pastefromoffice~PasteFromOffice) - CKEditor 5 API docs</a>
 */
export default class PasteFromOffice extends Plugin {
  static readonly pluginName: "PasteFromOffice";

  static readonly requires: Array<new(editor: Editor) => Plugin>;
}

/**
 * Augments data by an attribute, which signals, if it has been processed
 * by paste-from-office.
 */
export class PasteFromOfficeClipboardEventData extends ClipboardEventData {
  isTransformedWithPasteFromOffice: boolean;
}
