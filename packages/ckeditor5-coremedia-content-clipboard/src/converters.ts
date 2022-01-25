import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import {
  AddMarkerEventData,
  DowncastConversionApi,
  RemoveMarkerEventData,
} from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import ContentDropDataCache from "./ContentDropDataCache";
import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";

/**
 * Conversion function used in DowncastDispatcher event listeners.
 * Adds a UIElement to the editing view at a given marker position.
 * The marker position is retrieved from the data object provided by the event listener.
 *
 * The added UIElement renders a loading spinner into the editing view without changing the model.
 *
 * @param callback - the callback to be executed after the UIElement has been added (Usually to load the data for the loading spinner). Gets the markerData of the corresponding marker as the sole argument.
 */
export const addContentMarkerConversion = (callback: (markerData: MarkerData) => void) => {
  return (evt: EventInfo, data: AddMarkerEventData, conversionApi: DowncastConversionApi): void => {
    const viewPosition = conversionApi.mapper.toViewPosition(data.markerRange.start);
    const contentDropData = ContentDropDataCache.lookupData(data.markerName);
    if (!contentDropData) {
      return;
    }

    const loadMaskClasses = ["cm-load-mask"];
    if (contentDropData.itemContext.isInline) {
      loadMaskClasses.push("cm-load-mask--inline");
    }
    const viewContainer = conversionApi.writer.createUIElement("div", { class: loadMaskClasses.join(" ") });
    conversionApi.writer.insert(viewPosition, viewContainer);
    conversionApi.mapper.bindElementToMarker(viewContainer, data.markerName);
    const markerData = ContentClipboardMarkerDataUtils.splitMarkerName(data.markerName);
    callback(markerData);

    evt.stop();
  };
};

/**
 * Conversion function used in DowncastDispatcher event listeners.
 * Removes a previously added UIElement from the editing view at a given marker position.
 * Does not change the model.
 *
 * @param evt - eventInfo
 * @param data - the remove marker event data
 * @param conversionApi - downcast conversion api
 */
export const removeContentMarkerConversion = (
  evt: EventInfo,
  data: RemoveMarkerEventData,
  conversionApi: DowncastConversionApi
): void => {
  const elements = conversionApi.mapper.markerNameToElements(data.markerName);
  if (!elements) {
    return;
  }
  elements.forEach(function (element) {
    conversionApi.mapper.unbindElementFromMarkerName(element, data.markerName);
    const range = conversionApi.writer.createRangeOn(element);
    conversionApi.writer.clear(range, element);
  });

  conversionApi.writer.clearClonedElementsGroup(data.markerName);

  evt.stop();
};
