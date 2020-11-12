import DomEventData from "@ckeditor/ckeditor5-engine/src/view/observer/domeventdata";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_clipboard_clipboardobserver-ClipboardEventData.html">Class ClipboardEventData (clipboard/clipboardobserver~ClipboardEventData) - CKEditor 5 API docs</a>
 */
export default class ClipboardEventData extends DomEventData {
  readonly dataTransfer: DataTransfer;
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_clipboard_datatransfer-DataTransfer.html">Class DataTransfer (clipboard/datatransfer~DataTransfer) - CKEditor 5 API docs</a>
 */
export class DataTransfer {
}
