import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import "../theme/loadmask.css";

import DowncastDispatcher from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";
import { addContentMarkerConversion, removeContentMarkerConversion } from "./converters";
import DataToModelMechanism from "./DataToModelMechanism";
import ContentToModelRegistry from "./ContentToModelRegistry";
import { createLinkModelFunctionCreator } from "./createmodelfunctions";

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
    ContentClipboardEditing.#setupContentToModelRegistry();
    return null;
  }

  #defineConverters(): void {
    const editor = this.editor;
    const conversion = editor.conversion;

    conversion.for("editingDowncast").add((dispatcher: DowncastDispatcher) => {
      dispatcher.on(ContentClipboardEditing.#CONTENT_DROP_ADD_MARKER_EVENT, this.#onAddMarker(editor));
      dispatcher.on(ContentClipboardEditing.#CONTENT_DROP_REMOVE_MARKER_EVENT, removeContentMarkerConversion);
    });
  }

  #onAddMarker(editor: Editor) {
    return addContentMarkerConversion((markerData: MarkerData): void => {
      DataToModelMechanism.triggerLoadAndWriteToModel(editor, markerData);
    });
  }

  static #setupContentToModelRegistry() {
    ContentToModelRegistry.registerToModelFunction("link", createLinkModelFunctionCreator);
    ContentToModelRegistry.registerToModelFunction("image", createLinkModelFunctionCreator);
  }
}
