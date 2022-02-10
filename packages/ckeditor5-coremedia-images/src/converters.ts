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

export const downcastCustomClasses = (
  viewElementName: string,
  modelElementName: string
): DowncastConversionHelperFunction => {
  return (dispatcher: DowncastDispatcher) =>
    dispatcher.on(
      `insert:${modelElementName}`,
      (evt: EventInfo, data: DowncastEventData, conversionApi: DowncastConversionApi) => {
        onImageInlineDowncast(viewElementName, data, conversionApi);
      },
      { priority: "low" }
    );
};

const onImageInlineDowncast = (
  viewElementName: string,
  data: DowncastEventData,
  conversionApi: DowncastConversionApi
): void => {
  const modelElement = data.item;
  const viewSpan = conversionApi.mapper.toViewElement(modelElement);
  if (!viewSpan) {
    return;
  }

  //image inline consists of two elements (span, img) and therefore the method gets called once with the span element and once
  //The span element events are first, afterwards img events. I suppose something is happening between those events which is necessary
  //to make it work. Classes added to the img are ignored. => We don't do anything if it is not the span element.
  if (!viewSpan.is("element", "span")) {
    return;
  }

  const viewImageElement = findViewChild(viewSpan, viewElementName, conversionApi);
  if (!viewImageElement) {
    return;
  }
  conversionApi.writer.addClass(modelElement.getAttribute("cmClass"), viewImageElement);
};

const findViewChild = (viewElement: ViewElement, viewElementName: string, conversionApi: DowncastConversionApi) => {
  const viewChildren = Array.from(conversionApi.writer.createRangeIn(viewElement).getItems());

  return viewChildren.find((item) => item.is("element", viewElementName));
};
