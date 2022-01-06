import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import "../theme/loadmask.css";

import { DowncastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import PlaceholderDataCache, { PlaceholderData } from "./PlaceholderDataCache";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import UIElement from "@ckeditor/ckeditor5-engine/src/view/uielement";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor
  from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { serviceAgent } from "@coremedia/service-agent";

export default class ContentPlaceholderEditing extends Plugin {
  static #CONTENT_PLACEHOLDER_EDITING_PLUGIN_NAME = "ContentPlaceholderEditing";
  static #LOGGER: Logger = LoggerProvider.getLogger(ContentPlaceholderEditing.#CONTENT_PLACEHOLDER_EDITING_PLUGIN_NAME);

  static get pluginName(): string {
    return ContentPlaceholderEditing.#CONTENT_PLACEHOLDER_EDITING_PLUGIN_NAME;
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
    conversion.for("editingDowncast").markerToElement({
      model: "content",
      view: (markerData: any, conversionApi: DowncastConversionApi) => {
        ContentPlaceholderEditing.#triggerLoadAndWriteToModel(editor, markerData.markerName.split(":")[1]);
        return conversionApi.writer.createUIElement("span", { class: "cm-load-mask" }, function (this: UIElement, dom: Document): Element {
          const uielement: UIElement = this as unknown as UIElement;
          const htmlElement = uielement.toDomElement(dom);
          htmlElement.innerHTML = "loading...";
          return htmlElement;
        });
      },
    });
  }

  static #triggerLoadAndWriteToModel(editor: Editor, placeholderId: string): void {
    const lookupData = PlaceholderDataCache.lookupData(placeholderId);
    if (!lookupData) {
      return;
    }
    ContentPlaceholderEditing.#LOGGER.debug(
      `Looking for replace marker (${placeholderId}) with content ${lookupData.contentUri}`
    );

    serviceAgent
      .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
      .then((contentDisplayService: ContentDisplayService): void => {
        contentDisplayService.name(lookupData.contentUri).then(name => {
          ContentPlaceholderEditing.#writeLinkToModel(editor, lookupData, placeholderId, name);
        });
      });

  }

  static #writeLinkToModel(editor: Editor, lookupData: PlaceholderData, placeholderId: string, name: string): void {
    editor.model.enqueueChange(lookupData.batch, (writer: Writer): void => {
      const contentUri: string = lookupData.contentUri;
      const link = writer.createText(name, {
        linkHref: contentUri,
      });

      const marker = writer.model.markers.get("content:" + placeholderId);
      if (!marker) {
        return;
      }

      const start: Position | undefined = marker.getStart();
      if (start) {
        writer.insert(link, start);
      }
      writer.removeMarker(marker);
      PlaceholderDataCache.removeData(placeholderId);
    });
  }
}
