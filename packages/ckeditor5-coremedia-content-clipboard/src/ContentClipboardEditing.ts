import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import "../theme/loadmask.css";

import DowncastDispatcher from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";
import { addContentMarkerConversion, removeContentMarkerConversion } from "./converters";
import InputContentResolver from "./InputContentResolver";
import ContentToModelRegistry, { CreateModelFunction, CreateModelFunctionCreator } from "./ContentToModelRegistry";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Node from "@ckeditor/ckeditor5-engine/src/model/node";
import { requireContentCkeModelUri } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { serviceAgent } from "@coremedia/service-agent";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { ROOT_NAME } from "@coremedia/ckeditor5-coremedia-studio-integration/content/Constants";

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
      dispatcher.on(
        ContentClipboardEditing.#CONTENT_DROP_ADD_MARKER_EVENT,
        addContentMarkerConversion((markerData: MarkerData): void => {
          InputContentResolver.triggerLoadAndWriteToModel(editor, markerData);
        })
      );
      dispatcher.on(ContentClipboardEditing.#CONTENT_DROP_REMOVE_MARKER_EVENT, removeContentMarkerConversion);
    });
  }

  static #setupContentToModelRegistry() {
    ContentToModelRegistry.registerToModelFunction("link", ContentClipboardEditing.#createLinkModelFunctionCreator);
    ContentToModelRegistry.registerToModelFunction("image", ContentClipboardEditing.#createLinkModelFunctionCreator);
  }

  static #createLinkModelFunctionCreator: CreateModelFunctionCreator = (
    contentUri: string
  ): Promise<CreateModelFunction> => {
    return serviceAgent
      .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
      .then((contentDisplayService: ContentDisplayService): Promise<string> => {
        return contentDisplayService.name(contentUri);
      })
      .then((name: string): Promise<CreateModelFunction> => {
        return ContentClipboardEditing.#createLinkModelFunctionPromise(contentUri, name);
      });
  };

  static #createLinkModelFunctionPromise(contentUri: string, name: string): Promise<CreateModelFunction> {
    return new Promise<CreateModelFunction>((resolve) => {
      resolve(ContentClipboardEditing.#createLinkModelFunction(contentUri, name));
    });
  }

  static #createLinkModelFunction(contentUri: string, name: string): CreateModelFunction {
    const nameToPass = name ? name : ROOT_NAME;
    return (writer: Writer): Node => {
      return writer.createText(nameToPass, {
        linkHref: requireContentCkeModelUri(contentUri),
      });
    };
  }
}
