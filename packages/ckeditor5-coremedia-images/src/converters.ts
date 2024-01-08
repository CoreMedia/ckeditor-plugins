/* eslint no-null/no-null: off */

import { EventInfo } from "@ckeditor/ckeditor5-utils";
import { DowncastDispatcher, ViewElement, DowncastWriter, Element as ModelElement } from "@ckeditor/ckeditor5-engine";
import { serviceAgent } from "@coremedia/service-agent";
import { createBlobDisplayServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/BlobDisplayServiceDescriptor";
import { InlinePreview } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/BlobDisplayService";
import { requireContentUriPath, UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/UriPath";
import { Editor } from "@ckeditor/ckeditor5-core";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import { IMAGE_PLUGIN_NAME, IMAGE_SPINNER_CSS_CLASS, IMAGE_SPINNER_SVG } from "./constants";
import ModelBoundSubscriptionPlugin from "./ModelBoundSubscriptionPlugin";
import "../theme/loadmask.css";
import "./lang/contentimage";
import Logger from "@coremedia/ckeditor5-logging/src/logging/Logger";
import { getOptionalPlugin } from "@coremedia/ckeditor5-core-common/src/Plugins";

const LOGGER = LoggerProvider.getLogger(IMAGE_PLUGIN_NAME);

interface DowncastEventData {
  item: ModelElement;
  attributeOldValue: string | null;
  attributeNewValue: string | null;
}
export type DowncastConversionHelperFunction = (dispatcher: DowncastDispatcher) => void;

/**
 * Conversion for `modelElementName:xlink-href` to `img:src`.
 *
 * @param editor - the editor instance
 * @param modelElementName - the element name to convert
 * @param logger - the logger
 */
export const editingDowncastXlinkHref =
  (editor: Editor, modelElementName: string, logger: Logger): DowncastConversionHelperFunction =>
  (dispatcher: DowncastDispatcher) => {
    dispatcher.on(`attribute:xlink-href:${modelElementName}`, (eventInfo: EventInfo, data: DowncastEventData): void => {
      if (!data.attributeNewValue) {
        // There was no xlink-href set for this image, therefore, we can skip
        // applying the loading spinner and resolving the image src
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      onXlinkHrefEditingDowncast(editor, eventInfo, data, logger);
    });
  };

const onXlinkHrefEditingDowncast = (
  editor: Editor,
  eventInfo: EventInfo,
  data: DowncastEventData,
  logger: Logger,
): void => {
  const spinnerPreviewAttributes = createSpinnerImagePreviewAttributes(editor);
  updateImagePreviewAttributes(editor, data.item, spinnerPreviewAttributes, true);

  const xlinkHref = data.item.getAttribute("xlink-href");

  if (typeof xlinkHref !== "string") {
    throw new Error(`Unexpected type ${typeof xlinkHref} of attribute xlink-href (value: ${xlinkHref}).`);
  }

  let uriPath: UriPath;
  try {
    uriPath = toUriPath(xlinkHref);
  } catch (e) {
    // toUriPath() might throw an exception, but an unresolvable
    // uriPath should not result in an error, which would break the editor.
    // Therefore: Return early. An endless loading spinner will be displayed as a result.
    logger.debug("Cannot resolve valid uriPath from xlink-href attribute:", xlinkHref);
    return;
  }

  const property: string = toProperty(xlinkHref);
  void serviceAgent
    .fetchService(createBlobDisplayServiceDescriptor())
    .then((blobDisplayService) => blobDisplayService.observe_asInlinePreview(uriPath, property))
    .then((inlinePreviewObservable) => {
      const subscription = inlinePreviewObservable.subscribe((inlinePreview) => {
        updateImagePreviewAttributes(editor, data.item, inlinePreview, false);
      });

      getOptionalPlugin(editor, ModelBoundSubscriptionPlugin)?.addSubscription(data.item, subscription);
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
  withSpinnerClass: boolean,
): void => {
  const imgTag = findImgTag(editor, modelElement);
  if (!imgTag) {
    LOGGER.debug("Model Element can't be mapped to view, probably meanwhile removed by an editor", modelElement);
    return;
  }
  if (withSpinnerClass) {
    writeImageToView(editor, inlinePreview, imgTag, withSpinnerClass);
    return;
  }

  // Preload the image. An image size can be multiple megabytes. Preloading
  // ensures that the spinner will stay until the image is loaded.
  const image = new Image();
  image.onload = () => writeImageToView(editor, inlinePreview, imgTag, withSpinnerClass);
  image.src = inlinePreview.thumbnailSrc;
};

const writeImageToView = (
  editor: Editor,
  inlinePreview: InlinePreview,
  imgTag: ViewElement,
  withSpinnerClass: boolean,
): void => {
  editor.editing.view.change((writer: DowncastWriter) => {
    writer.setAttribute("src", inlinePreview.thumbnailSrc, imgTag);
    writer.setAttribute("title", inlinePreview.thumbnailTitle, imgTag);

    // The placeholders need a width to be shown as the image itself does not
    // have a width.
    if (inlinePreview.isPlaceholder) {
      writer.setStyle("width", "24px", imgTag);
    } else {
      writer.removeStyle("width", imgTag);
    }

    if (withSpinnerClass) {
      writer.addClass(IMAGE_SPINNER_CSS_CLASS, imgTag);
    } else {
      writer.removeClass(IMAGE_SPINNER_CSS_CLASS, imgTag);
    }
  });
};

const toUriPath = (xlinkHref: string): string => {
  const contentUriPart = xlinkHref.split("#")[0];
  return requireContentUriPath(contentUriPart);
};

const toProperty = (xlinkHref: string): string => xlinkHref.split("#")[1];

const findViewChild = (editor: Editor, viewElement: ViewElement, viewElementName: string): ViewElement | null => {
  const rangeInElement = editor.editing.view.createRangeIn(viewElement);
  const viewChildren = Array.from(rangeInElement.getItems());

  return viewChildren.find((item) => item.is("element", viewElementName)) as ViewElement;
};

const createSpinnerImagePreviewAttributes = (editor: Editor): InlinePreview => {
  const t = editor.locale.t;
  return {
    thumbnailSrc: IMAGE_SPINNER_SVG,
    thumbnailTitle: t("loading..."),
    isPlaceholder: false,
  };
};
