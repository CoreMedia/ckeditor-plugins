import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import "../theme/loadmask.css";

import DowncastDispatcher, {
  AddMarkerEventData,
  DowncastConversionApi, RemoveMarkerEventData
} from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import PlaceholderDataCache, { PlaceholderData } from "./PlaceholderDataCache";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import UIElement from "@ckeditor/ckeditor5-engine/src/view/uielement";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor
  from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { serviceAgent } from "@coremedia/service-agent";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import { Marker } from "@ckeditor/ckeditor5-engine/src/model/markercollection";

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

    conversion.for("editingDowncast").add( (dispatcher: DowncastDispatcher) => {
      dispatcher.on("addMarker:content", (evt: EventInfo, data: AddMarkerEventData, conversionApi: DowncastConversionApi) => {
        ContentPlaceholderEditing.#addContentMarkerConversion(editor, evt, data, conversionApi);
      });
      dispatcher.on("removeMarker:content", (evt: EventInfo, data: RemoveMarkerEventData, conversionApi: DowncastConversionApi) => {
        ContentPlaceholderEditing.#removeContentMarkerConversion(editor, evt, data, conversionApi);
      });
    });
  }

  static #addContentMarkerConversion(editor: Editor, evt: EventInfo, data: AddMarkerEventData, conversionApi: DowncastConversionApi): void {
    const viewPosition = conversionApi.mapper.toViewPosition( data.markerRange.start );
    const viewContainer = conversionApi.writer.createUIElement("div", { class: "cm-load-mask cm-load-mask-inline" }, function (this: UIElement, dom: Document): Element {
      const uielement: UIElement = this as unknown as UIElement;
      const htmlElement = uielement.toDomElement(dom);
      htmlElement.innerHTML = "loading...";
      return htmlElement;
    });
    conversionApi.writer.insert( viewPosition, viewContainer );
    conversionApi.mapper.bindElementToMarker( viewContainer, data.markerName );

    ContentPlaceholderEditing.#triggerLoadAndWriteToModel(editor, data.markerName.split(":")[1]);

    evt.stop();
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
        const positionBeforeInsertedItem = writer.createPositionBefore(link);
        ContentPlaceholderEditing.#moveMarkerForPreviousItemsToLeft(editor, positionBeforeInsertedItem, marker, lookupData);
      }
      writer.removeMarker(marker);
      PlaceholderDataCache.removeData(placeholderId);
    });
  }

  static #moveMarkerForPreviousItemsToLeft(editor: Editor, start: Position, marker: Marker, lookupData: PlaceholderData) {
    const markers: Array<Marker> = ContentPlaceholderEditing.#findMarkersBefore(editor, marker, lookupData);
    markers.forEach((markerToMoveToLeft: Marker) => {

      //Each Marker has its own batch so everything is executed in one step and in the end everything is one undo/redo step.
      const currentData = PlaceholderDataCache.lookupData(markerToMoveToLeft.name.split(":")[1]);
      if (!currentData) {
        return;
      }
      editor.model.enqueueChange(currentData.batch, (writer: Writer): void => {
          const newRange = writer.createRange(start, start);
          writer.updateMarker(markerToMoveToLeft, {range: newRange})
      });
    })
  }

  static #findMarkersBefore(editor: Editor, marker: Marker, lookupData: PlaceholderData): Array<Marker> {
    const markersAtSamePosition = ContentPlaceholderEditing.#markersAtPosition(editor, marker.getStart());
    const actualInsertIndex = lookupData.dropContext.index;

    return markersAtSamePosition.filter(value => {
      const placeholderId:string = value.name.split(":")[1];
      const lookupDataForMarker = PlaceholderDataCache.lookupData(placeholderId);
      if (!lookupDataForMarker) {
        return false
      }
      return lookupDataForMarker.dropContext.index < actualInsertIndex;
    });
  }

  static #markersAtPosition(editor: Editor, position: Position): Array<Marker> {
    return Array.from(editor.model.markers.getMarkersGroup("content")).filter(value => {
      return value.getStart().isEqual(position);
    });
  }

  static #removeContentMarkerConversion(editor: Editor, evt: EventInfo, data: RemoveMarkerEventData, conversionApi: DowncastConversionApi) {
    const elements = conversionApi.mapper.markerNameToElements( data.markerName );
    if ( !elements ) {
      return;
    }
    elements.forEach(function(element){
      conversionApi.mapper.unbindElementFromMarkerName( element, data.markerName );
      const range = conversionApi.writer.createRangeOn( element );
      conversionApi.writer.clear( range, element );
    });

    conversionApi.writer.clearClonedElementsGroup( data.markerName );

    evt.stop();
  }
}
