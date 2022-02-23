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
import { serviceAgent } from "@coremedia/service-agent";
import BlobDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/BlobDisplayServiceDescriptor";
import BlobDisplayService, {
  InlinePreview,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/BlobDisplayService";
import { requireContentUriPath, UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import DowncastWriter from "@ckeditor/ckeditor5-engine/src/view/downcastwriter";
import ModelElement from "@ckeditor/ckeditor5-engine/src/model/element";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { IMAGE_PLUGIN_NAME } from "./constants";
import ModelBoundSubscriptionPlugin from "./ModelBoundSubscriptionPlugin";
import "../theme/loadmask.css";
import "./lang/contentimage";

const LOGGER = LoggerProvider.getLogger(IMAGE_PLUGIN_NAME);

export const preventUpcastImageSrc = () => {
  return (dispatcher: UpcastDispatcher): void => {
    dispatcher.on(
      `element:img`,
      (evt: EventInfo, data: UpcastEventData, conversionApi: UpcastConversionApi) => {
        conversionApi.consumable.consume(data.viewItem, { attributes: "src" });
      },
      { priority: "highest" }
    );
  };
};

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
  editor: Editor,
  viewElementName: string,
  modelElementName: string
): DowncastConversionHelperFunction => {
  return (dispatcher: DowncastDispatcher) =>
    dispatcher.on(
      `insert:${modelElementName}`,
      (evt: EventInfo, data: DowncastEventData, conversionApi: DowncastConversionApi) => {
        onImageInlineEditingDowncast(editor, viewElementName, data, conversionApi);
      },
      { priority: "low" }
    );
};

export const editingDowncastXlinkHref = (
  editor: Editor,
  modelElementName: string,
  modelAttributeName: string
): DowncastConversionHelperFunction => {
  return (dispatcher: DowncastDispatcher) => {
    dispatcher.on(
      `attribute:${modelAttributeName}:${modelElementName}`,
      (eventInfo: EventInfo, data: DowncastEventData): void => {
        onImageInlineXlinkHrefEditingDowncast(editor, eventInfo, data);
      }
    );
  };
};

const onImageInlineXlinkHrefEditingDowncast = (editor: Editor, eventInfo: EventInfo, data: DowncastEventData): void => {
  const t = editor.locale.t;
  const loadingSpinnerSVG =
    "data:image/svg+xml;utf8,<svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 16 16' style='enable-background:new 0 0 16 16;' xml:space='preserve'><style type='text/css'>.st0{fill:%233D4242;}</style><g><path class='st0' d='M4.08,7.22c0.1-0.52,0.31-1.01,0.59-1.43l-2.5-1.66c-0.5,0.75-0.86,1.6-1.04,2.51L4.08,7.22z'/><path class='st0' d='M5.78,4.67c0.43-0.29,0.91-0.49,1.43-0.59L6.63,1.14C5.71,1.32,4.87,1.68,4.12,2.18L5.78,4.67z'/><path class='st0' d='M9.37,1.14L8.78,4.08c0.52,0.1,1.01,0.31,1.43,0.59l1.66-2.5C11.13,1.68,10.29,1.32,9.37,1.14z'/><path class='st0' d='M4.67,10.22C4.39,9.79,4.18,9.31,4.08,8.78L1.14,9.37c0.18,0.91,0.54,1.76,1.04,2.51L4.67,10.22z'/><path class='st0' d='M11.92,8.78c-0.1,0.52-0.31,1.01-0.59,1.43l2.5,1.66c0.5-0.75,0.86-1.6,1.04-2.51L11.92,8.78z'/><path class='st0' d='M7.22,11.92c-0.52-0.1-1.01-0.31-1.43-0.59l-1.66,2.5c0.75,0.5,1.6,0.86,2.51,1.04L7.22,11.92z'/><path class='st0' d='M11.33,5.78c0.29,0.43,0.49,0.91,0.59,1.43l2.94-0.59c-0.18-0.91-0.54-1.76-1.04-2.51L11.33,5.78z'/><path class='st0' d='M10.22,11.33c-0.43,0.29-0.91,0.49-1.43,0.59l0.59,2.94c0.91-0.18,1.76-0.54,2.51-1.04L10.22,11.33z'/></g></svg>";
  updateImagePreviewAttributes(
    editor,
    data.item,
    {
      thumbnailSrc: loadingSpinnerSVG,
      thumbnailTitle: t("loading..."),
      isPlaceholder: false,
    },
    true
  );
  const xlinkHref = data.item.getAttribute("xlink-href");
  const uriPath: UriPath = toUriPath(xlinkHref);
  const property: string = toProperty(xlinkHref);
  serviceAgent
    .fetchService<BlobDisplayService>(new BlobDisplayServiceDescriptor())
    .then((blobDisplayService: BlobDisplayService) => blobDisplayService.observe_asInlinePreview(uriPath, property))
    .then((inlinePreviewObservable) => {
      const subscription = inlinePreviewObservable.subscribe((inlinePreview) => {
        updateImagePreviewAttributes(editor, data.item, inlinePreview, false);
      });
      const modelBoundSubscriptionPlugin = <ModelBoundSubscriptionPlugin>(
        editor.plugins.get(ModelBoundSubscriptionPlugin.PLUGIN_NAME)
      );
      if (modelBoundSubscriptionPlugin) {
        modelBoundSubscriptionPlugin.addSubscription(data.item, subscription);
      }
    });
};

const findImgTag = (editor: Editor, modelItem: ModelElement): ViewElement | null => {
  const toViewElement = editor.editing.mapper.toViewElement(modelItem);
  if (!toViewElement) {
    return null;
  }

  return findViewChild(editor, toViewElement, "img");
};

const updateImagePreviewAttributes = (
  editor: Editor,
  modelElement: ModelElement,
  inlinePreview: InlinePreview,
  withSpinnerClass: boolean
): void => {
  const imgTag = findImgTag(editor, modelElement);
  if (!imgTag) {
    LOGGER.debug("Model Element can't be mapped to view, probably meanwhile removed by an editor", modelElement);
    return;
  }
  editor.editing.view.change((writer: DowncastWriter) => {
    writer.setAttribute("src", inlinePreview.thumbnailSrc, imgTag);
    writer.setAttribute("title", inlinePreview.thumbnailTitle, imgTag);
    if (inlinePreview.isPlaceholder) {
      writer.setStyle("width", "24px", imgTag);
    } else {
      writer.removeStyle("width", imgTag);
    }

    if (withSpinnerClass) {
      writer.addClass("cm-load-mask", imgTag);
    } else {
      writer.removeClass("cm-load-mask", imgTag);
    }
  });
};

const toUriPath = (xlinkHref: string): string => {
  const contentUriPart = xlinkHref.split("#")[0];
  return requireContentUriPath(contentUriPart);
};

const toProperty = (xlinkHref: string): string => {
  return xlinkHref.split("#")[1];
};

const onImageInlineEditingDowncast = (
  editor: Editor,
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

  const viewImageElement = findViewChild(editor, viewSpan, viewElementName);
  if (!viewImageElement) {
    return;
  }
  conversionApi.writer.addClass(modelElement.getAttribute("cmClass"), viewImageElement);
};

const findViewChild = (editor: Editor, viewElement: ViewElement, viewElementName: string): ViewElement | null => {
  const rangeInElement = editor.editing.view.createRangeIn(viewElement);
  const viewChildren = Array.from(rangeInElement.getItems());

  return viewChildren.find((item) => item.is("element", viewElementName)) as ViewElement;
};
