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
import { ContentClipboardMarkerUtils, MarkerData } from "./ContentClipboardMarkerUtils";

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
    const lookupData = PlaceholderDataCache.lookupData(data.markerName);
    if (!lookupData) {
      return;
    }

    let cssClass = lookupData.isEmbeddableContent || lookupData.dropContext.multipleItemsDropped ? "" : "cm-load-mask-inline";
    const viewContainer = conversionApi.writer.createUIElement("div", { class: "cm-load-mask "+cssClass }, function (this: UIElement, dom: Document): Element {
      const uielement: UIElement = this as unknown as UIElement;
      const htmlElement = uielement.toDomElement(dom);
      htmlElement.innerHTML = "loading...";
      return htmlElement;
    });
    conversionApi.writer.insert( viewPosition, viewContainer );
    conversionApi.mapper.bindElementToMarker( viewContainer, data.markerName );
    const markerData = ContentClipboardMarkerUtils.splitMarkerName(data.markerName);
    ContentPlaceholderEditing.#triggerLoadAndWriteToModel(editor, markerData);

    evt.stop();
  }

  static #triggerLoadAndWriteToModel(editor: Editor, markerData: MarkerData): void {
    const markerName: string = ContentClipboardMarkerUtils.toMarkerName(markerData.prefix, markerData.dropId, markerData.item);
    const lookupData = PlaceholderDataCache.lookupData(markerName);
    if (!lookupData) {
      return;
    }
    ContentPlaceholderEditing.#LOGGER.debug(
      `Looking for replace marker (${markerName}) with content ${lookupData.contentUri}`
    );

    serviceAgent
      .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
      .then((contentDisplayService: ContentDisplayService): void => {
        contentDisplayService.name(lookupData.contentUri).then(name => {
          ContentPlaceholderEditing.#writeLinkToModel(editor, lookupData, markerData, name);
        });
      });
  }

  static #writeLinkToModel(editor: Editor, lookupData: PlaceholderData, markerData: MarkerData, name: string): void {
    editor.model.enqueueChange(lookupData.batch, (writer: Writer): void => {
      const contentUri: string = lookupData.contentUri;
      const link = writer.createText(name, {
        linkHref: contentUri,
      });

      const marker = writer.model.markers.get(ContentClipboardMarkerUtils.toMarkerNameFromData(markerData));
      if (!marker) {
        return;
      }
      const start: Position | undefined = marker.getStart();
      if (start) {
        writer.insert(link, start);

        ContentPlaceholderEditing.#moveMarkerForPreviousItemsToLeft(editor, start, marker, lookupData);
        writer.removeMarker(marker);
      }
      PlaceholderDataCache.removeData(marker.name);
    });
  }

  static #moveMarkerForPreviousItemsToLeft(editor: Editor, start: Position, marker: Marker, lookupData: PlaceholderData) {
    const markers: Array<Marker> = ContentPlaceholderEditing.#findMarkersBefore(editor, marker, lookupData);
    markers.forEach((markerToMoveToLeft: Marker) => {

      //Each Marker has its own batch so everything is executed in one step and in the end everything is one undo/redo step.
      const currentData = PlaceholderDataCache.lookupData(markerToMoveToLeft.name);
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
    const markerData = ContentClipboardMarkerUtils.splitMarkerName(marker.name);
    const dropId = markerData.dropId;

    return markersAtSamePosition.filter(value => {
      const actualMarker = ContentClipboardMarkerUtils.splitMarkerName(value.name);
      const lookupDataForMarker = PlaceholderDataCache.lookupData(value.name);
      if (!lookupDataForMarker) {
        return false
      }
      //dropId = Timestamp when a group of marker have been created.
      //If we are in the same group of markers (part of one drop) we want to adapt all markers with a
      //smaller index.
      if (actualMarker.dropId === dropId) {
        return lookupDataForMarker.dropContext.index < actualInsertIndex;
      }

      //If a drop done later to the same position happened we want to make sure all the dropped
      //items stay on the left of the marker.
      return actualMarker.dropId > dropId
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
