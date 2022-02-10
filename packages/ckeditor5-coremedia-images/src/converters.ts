/**
 * Creates an upcast converter that will pass all classes from the view element to the model element.
 */
import {
  DowncastConversionHelperFunction,
  UpcastConversionHelperFunction,
} from "@ckeditor/ckeditor5-engine/src/conversion/conversionhelpers";
import UpcastDispatcher, {
  UpcastConversionApi,
  UpcastEventData,
} from "@ckeditor/ckeditor5-engine/src/conversion/upcastdispatcher";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DowncastDispatcher, {
  DowncastConversionApi,
  DowncastEventData,
} from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import ViewElement from "@ckeditor/ckeditor5-engine/src/view/element";

export const upcastCustomClasses = (viewElementName: string): UpcastConversionHelperFunction => {
  return (dispatcher: UpcastDispatcher): void =>
    dispatcher.on(`element:${viewElementName}`, onImgTagUpcast, { priority: "low" });
};

const onImgTagUpcast = (evt: EventInfo, data: UpcastEventData, conversionApi: UpcastConversionApi): void => {
  const viewItem = data.viewItem;
  const modelRange = data.modelRange;

  const modelElement = modelRange && modelRange.start.nodeAfter;
  if (!modelElement) {
    return;
  }

  const currentAttributeValue = modelElement.getAttribute("cmClass") || [];

  currentAttributeValue.push(...viewItem.getClassNames());
  conversionApi.writer.setAttribute("cmClass", currentAttributeValue, modelElement);
};

export const dataDowncastCustomClasses = (
  viewElementName: string,
  modelElementName: string
): DowncastConversionHelperFunction => {
  return (dispatcher: DowncastDispatcher) =>
    dispatcher.on(
      `insert:${modelElementName}`,
      (evt: EventInfo, data: DowncastEventData, conversionApi: DowncastConversionApi) => {
        onImageInlineDataDowncast(viewElementName, data, conversionApi);
      },
      { priority: "low" }
    );
};

const onImageInlineDataDowncast = (
  viewElementName: string,
  data: DowncastEventData,
  conversionApi: DowncastConversionApi
): void => {
  const modelElement = data.item;
  const viewImage = conversionApi.mapper.toViewElement(modelElement);
  if (!viewImage) {
    return;
  }

  if (!viewImage.is("element", viewElementName)) {
    return;
  }
  conversionApi.writer.addClass(modelElement.getAttribute("cmClass"), viewImage);
};

export const editingDowncastCustomClasses = (
  viewElementName: string,
  modelElementName: string
): DowncastConversionHelperFunction => {
  return (dispatcher: DowncastDispatcher) =>
    dispatcher.on(
      `insert:${modelElementName}`,
      (evt: EventInfo, data: DowncastEventData, conversionApi: DowncastConversionApi) => {
        onImageInlineEditingDowncast(viewElementName, data, conversionApi);
      },
      { priority: "low" }
    );
};

export const editingDowncastXlinkHref = (
  modelElementName: string,
  modelAttributeName: string
): DowncastConversionHelperFunction => {
  return (dispatcher: DowncastDispatcher) => {
    dispatcher.on(
      `attribute:${modelAttributeName}:${modelElementName}`,
      (eventInfo: EventInfo, data: DowncastEventData, conversionApi: DowncastConversionApi): void => {
        onImageInlineXlinkHrefEditingDowncast(eventInfo, data, conversionApi);
      }
    );
  };
};

const onImageInlineXlinkHrefEditingDowncast = (
  eventInfo: EventInfo,
  data: DowncastEventData,
  conversionApi: DowncastConversionApi
): void => {
  const toViewElement = conversionApi.mapper.toViewElement(data.item);
  if (!toViewElement) {
    return;
  }
  const imgTag = findViewChild(toViewElement, "img", conversionApi);
  conversionApi.writer.setAttribute("src", "broken image url", imgTag);
};

const onImageInlineEditingDowncast = (
  viewElementName: string,
  data: DowncastEventData,
  conversionApi: DowncastConversionApi
): void => {
  const modelElement = data.item;
  const viewSpan = conversionApi.mapper.toViewElement(modelElement);
  if (!viewSpan) {
    return;
  }

  if (!viewSpan.is("element", "span")) {
    return;
  }

  const viewImageElement = findViewChild(viewSpan, viewElementName, conversionApi);
  if (!viewImageElement) {
    return;
  }
  conversionApi.writer.addClass(modelElement.getAttribute("cmClass"), viewImageElement);
};

const findViewChild = (
  viewElement: ViewElement,
  viewElementName: string,
  conversionApi: DowncastConversionApi
): ViewElement | null => {
  const viewChildren = Array.from(conversionApi.writer.createRangeIn(viewElement).getItems());

  return viewChildren.find((item) => item.is("element", viewElementName)) as ViewElement;
};
