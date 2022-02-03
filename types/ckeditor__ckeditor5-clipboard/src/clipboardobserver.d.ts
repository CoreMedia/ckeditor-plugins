import DomEventData from "@ckeditor/ckeditor5-engine/src/view/observer/domeventdata";
import DocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import Range from "@ckeditor/ckeditor5-engine/src/model/range"

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_clipboard_clipboardobserver-ClipboardEventData.html">Class ClipboardEventData (clipboard/clipboardobserver~ClipboardEventData) - CKEditor 5 API docs</a>
 */
export default class ClipboardEventData extends DomEventData {
  readonly dataTransfer: DataTransfer;
  // TODO[cke] This is not part of the public API (and not even private).
  //   If required, document, where this property originates from. And:
  //   Is this really a CK-DocumentFragment? Or is it a standard DocumentFragment?
  content: DocumentFragment;
  targetRanges: Array<Range>;
  method: "paste" | "drop";
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_clipboard_datatransfer-DataTransfer.html">Class DataTransfer (clipboard/datatransfer~DataTransfer) - CKEditor 5 API docs</a>
 */
export class DataTransfer {
  dropEffect: "none" | "copy" | "link" | "move";
  effectAllowed: "none" | "copy" | "copyLink" | "copyMove" | "link" | "linkMove" | "move" | "all" | "uninitialized";
  isCanceled: boolean;
  readonly types: string[];
  readonly files: FileList;

  getData(type: string): string;
}
