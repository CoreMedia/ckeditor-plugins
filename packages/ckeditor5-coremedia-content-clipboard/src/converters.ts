import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import {
  AddMarkerEventData,
  DowncastConversionApi, RemoveMarkerEventData
} from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import ContentDropDataCache from "./ContentDropDataCache";
import UIElement from "@ckeditor/ckeditor5-engine/src/view/uielement";
import { ContentClipboardMarkerUtils, MarkerData } from "./ContentClipboardMarkerUtils";

export const addContentMarkerConversion = (callback: (markerData: MarkerData) => void) => {
  return (evt: EventInfo, data: AddMarkerEventData, conversionApi: DowncastConversionApi): void => {
    const viewPosition = conversionApi.mapper.toViewPosition( data.markerRange.start );
    const contentDropData = ContentDropDataCache.lookupData(data.markerName);
    if (!contentDropData) {
      return;
    }

    let loadMaskClasses = ["cm-load-mask"];
    if (!contentDropData.itemContext.isEmbeddableContent && !contentDropData.dropContext.multipleItemsDropped) {
      loadMaskClasses.push("cm-load-mask--inline");
    }
    const viewContainer = conversionApi.writer.createUIElement("div", { class: loadMaskClasses.join(" ") });
    conversionApi.writer.insert( viewPosition, viewContainer );
    conversionApi.mapper.bindElementToMarker( viewContainer, data.markerName );
    const markerData = ContentClipboardMarkerUtils.splitMarkerName(data.markerName);
    callback(markerData);

    evt.stop();
  }
}
export const removeContentMarkerConversion = (evt: EventInfo, data: RemoveMarkerEventData, conversionApi: DowncastConversionApi): void => {
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