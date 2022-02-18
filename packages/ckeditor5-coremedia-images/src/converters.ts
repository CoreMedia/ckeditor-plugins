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

const LOGGER = LoggerProvider.getLogger(IMAGE_PLUGIN_NAME);

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
  updateImagePreviewAttributes(editor, data.item, {
    thumbnailSrc: "placeholder image url",
    thumbnailTitle: "placeholder",
    isPlaceholder: true,
  });
  const xlinkHref = data.item.getAttribute("xlink-href");
  const uriPath: UriPath = toUriPath(xlinkHref);
  const property: string = toProperty(xlinkHref);
  serviceAgent
    .fetchService<BlobDisplayService>(new BlobDisplayServiceDescriptor())
    .then((blobDisplayService: BlobDisplayService) => blobDisplayService.observe_asInlinePreview(uriPath, property))
    .then((inlinePreviewObservable) => {
      const subscription = inlinePreviewObservable.subscribe((inlinePreview) => {
        updateImagePreviewAttributes(editor, data.item, inlinePreview);
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
  inlinePreview: InlinePreview
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
