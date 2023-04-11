import { Plugin, Editor } from "@ckeditor/ckeditor5-core";
import "../theme/loadmask.css";

import DowncastDispatcher from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";
import { addContentMarkerConversion, removeContentMarkerConversion } from "./converters";
import DataToModelMechanism from "./DataToModelMechanism";
import ContentToModelRegistry, { CreateModelFunctionCreator } from "./ContentToModelRegistry";
import { UndoSupport } from "./integrations/Undo";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";

const PLUGIN_NAME = "ContentClipboardEditing";

/**
 * The ContentClipboardEditing plugin listens to Content Input Markers, added by
 * the `ContentClipboard` plugin. It then loads the linked content, removes the
 * placeholder and renders the corresponding content.
 */
export default class ContentClipboardEditing extends Plugin {
  static readonly pluginName = PLUGIN_NAME;

  static readonly #CONTENT_INPUT_ADD_MARKER_EVENT =
    "addMarker:" + ContentClipboardMarkerDataUtils.CONTENT_INPUT_MARKER_PREFIX;
  static readonly #CONTENT_INPUT_REMOVE_MARKER_EVENT =
    "removeMarker:" + ContentClipboardMarkerDataUtils.CONTENT_INPUT_MARKER_PREFIX;

  static readonly requires = [UndoSupport];

  /**
   * All markers which are not yet finally inserted.
   *
   * Every marker which is set and started to be processed will be added to this list.
   * While updating the position of a marker CKEditor internally removes and adds the marker again.
   * Therefore, the marker will be added multiple times. This can be prevented by checking if the newly added marker
   * is in the pendingMarkerNames list.
   *
   * This is a performance optimization.
   *
   * @private
   */
  #pendingMarkerNames = new Array<string>();

  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);
    this.#defineConverters();
    reportInitEnd(initInformation);
  }

  #defineConverters(): void {
    const editor = this.editor;
    const conversion = editor.conversion;

    conversion.for("editingDowncast").add((dispatcher: DowncastDispatcher) => {
      dispatcher.on(ContentClipboardEditing.#CONTENT_INPUT_ADD_MARKER_EVENT, this.#onAddMarker(editor));
      dispatcher.on(ContentClipboardEditing.#CONTENT_INPUT_REMOVE_MARKER_EVENT, removeContentMarkerConversion);
    });
  }

  #onAddMarker(editor: Editor) {
    return addContentMarkerConversion(this.#pendingMarkerNames, (markerData: MarkerData): void => {
      DataToModelMechanism.triggerLoadAndWriteToModel(editor, this.#pendingMarkerNames, markerData);
    });
  }

  /**
   * This function is used to register "toModel" functions in other plugins.
   * These functions are held in the {@link ContentToModelRegistry} and are
   * used to insert content into the editor.
   *
   * Please note: Types that are not supported by the
   * {@link DataToModelMechanism} will fall back to the default "toModel"
   * function or throw an error.
   *
   * @param type - the identifier for the content (e.g. "link" or "image")
   * @param createModelFunctionCreator - a function that expects a contentUri as
   * parameter and returns a promise of type CreateModelFunction
   */
  registerToModelFunction(type: string, createModelFunctionCreator: CreateModelFunctionCreator): void {
    ContentToModelRegistry.registerToModelFunction(type, createModelFunctionCreator);
  }
}
