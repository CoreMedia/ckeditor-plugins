import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import "../theme/loadmask.css";

import DowncastDispatcher from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";
import { addContentMarkerConversion, removeContentMarkerConversion } from "./converters";
import DataToModelMechanism from "./DataToModelMechanism";
import ContentToModelRegistry, { CreateModelFunctionCreator } from "./ContentToModelRegistry";
import { UndoSupport } from "./integrations/Undo";

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
    return [UndoSupport];
  }

  init(): Promise<void> | void {
    this.#defineConverters();
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

  /**
   * This function is used to register "toModel" functions in other plugins.
   * These functions are held in the {@link ContentToModelRegistry} and are used to insert dropped content into the editor.
   *
   * Please note: Types that are not supported by the {@link DataToModelMechanism} will fall back to the default "toModel" function or throw an error.
   *
   * @param type - the identifier for the dropped content (e.g. "link" or "image")
   * @param createModelFunctionCreator - a function that expects a contentUri as parameter and returns a promise of type CreateModelFunction
   */
  registerToModelFunction(type: string, createModelFunctionCreator: CreateModelFunctionCreator): void {
    ContentToModelRegistry.registerToModelFunction(type, createModelFunctionCreator);
  }
}
