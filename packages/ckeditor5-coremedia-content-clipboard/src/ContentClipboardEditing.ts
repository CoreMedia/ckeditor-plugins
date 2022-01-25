import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import "../theme/loadmask.css";

import DowncastDispatcher from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";
import { addContentMarkerConversion, removeContentMarkerConversion } from "./converters";
import InputContentResolver from "./InputContentResolver";

export default class ContentClipboardEditing extends Plugin {
  static #CONTENT_CLIPBOARD_EDITING_PLUGIN_NAME = "ContentClipboardEditing";
  static readonly #CONTENT_DROP_ADD_MARKER_EVENT =
    "addMarker:" + ContentClipboardMarkerDataUtils.CONTENT_DROP_MARKER_PREFIX;
  static readonly #CONTENT_DROP_REMOVE_MARKER_EVENT =
    "removeMarker:" + ContentClipboardMarkerDataUtils.CONTENT_DROP_MARKER_PREFIX;
  static get pluginName(): string {
    return ContentClipboardEditing.#CONTENT_CLIPBOARD_EDITING_PLUGIN_NAME;
  }

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [];
  }

  init(): Promise<void> | null {
    this.#defineConverters();
    return null;
  }

  #defineConverters(): void {
    const editor = this.editor;
    const conversion = editor.conversion;

    conversion.for("editingDowncast").add((dispatcher: DowncastDispatcher) => {
      dispatcher.on(
        ContentClipboardEditing.#CONTENT_DROP_ADD_MARKER_EVENT,
        addContentMarkerConversion((markerData: MarkerData): void => {
          InputContentResolver.triggerLoadAndWriteToModel(editor, markerData);
        })
      );
      dispatcher.on(ContentClipboardEditing.#CONTENT_DROP_REMOVE_MARKER_EVENT, removeContentMarkerConversion);
    });
  }
}
