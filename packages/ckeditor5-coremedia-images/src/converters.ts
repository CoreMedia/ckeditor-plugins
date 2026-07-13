import { getOptionalPlugin } from "@coremedia/ckeditor5-core-common";
import type { InlinePreview, UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import {
  createBlobDisplayServiceDescriptor,
  requireContentUriPath,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import type { Logger } from "@coremedia/ckeditor5-logging";
import { LoggerProvider } from "@coremedia/ckeditor5-logging";
import { serviceAgent } from "@coremedia/service-agent";
import type {
  DowncastDispatcher,
  ViewDowncastWriter,
  Editor,
  ModelElement,
  EventInfo,
  UpcastConversionApi,
  UpcastDispatcher,
  ViewElement,
} from "ckeditor5";
import { IMAGE_PLUGIN_NAME, IMAGE_SPINNER_CSS_CLASS, IMAGE_SPINNER_SVG } from "./constants";
import ModelBoundSubscriptionPlugin from "./ModelBoundSubscriptionPlugin";
import "../theme/loadmask.css";
import "./lang/contentimage";

const LOGGER = LoggerProvider.getLogger(IMAGE_PLUGIN_NAME);

interface DowncastEventData {
  item: ModelElement;
  attributeOldValue: string | null;
  attributeNewValue: string | null;
}

export type DowncastConversionHelperFunction = (dispatcher: DowncastDispatcher) => void;

/**
 * A method to prevent the upcast of the src-attribute of an image.
 *
 * The `src` attribute for CoreMedia Images is not stored as a URL but as a
 * reference to a content property in a `xlink:href` attribute. In this case, it
 * does not make sense to work with `src`-attributes in the model and side
 * effects of an existing `src`-attribute (like GHS) have to be prevented.
 *
 * Preventing the `src` attribute to become part of the model means to consume
 * the attribute.
 *
 * Unfortunately, CKEditor 5 does not check if the attribute has already been
 * consumed:
 *
 * * [#11327: image conversion (imageInline and imageBlock) does not test if src is consumed.](https://github.com/ckeditor/ckeditor5/issues/11327)
 *
 * Combined with:
 *
 * * [#11530: The image upcast converter does not consume the `src` attribute](https://github.com/ckeditor/ckeditor5/issues/11530)
 *
 * the `src` attribute will be upcast if the `src` attribute exists as view
 * attribute. To fully prevent the upcast, we have to consume the attribute and
 * remove the `src` from the view node.
 */
export const preventUpcastImageSrc =
  () =>
  (dispatcher: UpcastDispatcher): void => {
    dispatcher.on(
      `element:img`,
      (evt: EventInfo, data, conversionApi: UpcastConversionApi) => {
        // eslint-disable-next-line
          if (data.viewItem.hasAttribute("data-xlink-href")) {
          // eslint-disable-next-line
            conversionApi.consumable.consume(data.viewItem, {
            attributes: "src",
          });
          // eslint-disable-next-line
            data.viewItem._removeAttribute("src");
        }
      },
      {
        priority: "highest",
      },
    );
  };

/**
 * High-priority upcast converter that creates `imageInline` for any
 * `<img data-xlink-href="...">` when the current insertion position allows
 * inline content (e.g. inside a paragraph).
 *
 * Without this, `ImageBlockEditing`'s `normal`-priority converter runs first
 * and calls `safeInsert` for an `imageBlock`. When the drop cursor is *inside*
 * a paragraph (between letters), `safeInsert` splits that paragraph to
 * accommodate the block element, leaving empty paragraph fragments behind.
 *
 * By creating `imageInline` at high priority for inline positions, no
 * paragraph splitting occurs. When the cursor is at a block-level position
 * (between paragraphs) `imageInline` is not allowed there; the converter
 * returns without consuming so that `ImageBlockEditing` can place an
 * `imageBlock` at block level. The `imageBlock` post-fixer then converts
 * that back to `paragraph + imageInline` without any splitting.
 */
export const upcastContentImageAsInline =
  (): ((dispatcher: UpcastDispatcher) => void) =>
  (dispatcher: UpcastDispatcher): void => {
    dispatcher.on(
      `element:img`,
      (evt: EventInfo, data, conversionApi: UpcastConversionApi) => {
        if (!data.viewItem.hasAttribute("data-xlink-href")) {
          return;
        }

        if (!conversionApi.consumable.test(data.viewItem, { name: true })) {
          return;
        }
        // Only proceed when imageInline is allowed at the current cursor
        // position. If not (e.g. between block elements at root level), fall
        // through to ImageBlockEditing so the post-fixer can handle it.

        if (!conversionApi.schema.checkChild(data.modelCursor, "imageInline")) {
          return;
        }

        const xlinkHref = String(data.viewItem.getAttribute("data-xlink-href"));
        const imageInline = conversionApi.writer.createElement("imageInline", {
          "xlink-href": xlinkHref,
        });

        if (!conversionApi.safeInsert(imageInline, data.modelCursor)) {
          return;
        }

        // Consume the element name so that ImageBlockEditing and
        // ImageInlineEditing (both guard with `consumable.test(viewItem,
        // { name: true })`) skip this element — they would otherwise create
        // a duplicate model element.
        //
        // Also consume `data-xlink-href` so the attributeToAttribute upcast
        // converter does not try to set xlink-href a second time (we already
        // set it directly in createElement above).
        //
        // IMPORTANT: do NOT call evt.stop() here. Other lower-priority
        // element:img listeners include CKEditor's attributeToAttribute
        // converters for `alt`, `width`, `height`, etc. They are guarded by
        // their own consumable entries ({ attributes: 'alt' }), not by
        // { name: true }, so they will still fire, find the imageInline via
        // data.modelRange, and set the remaining attributes correctly.
        conversionApi.consumable.consume(data.viewItem, { name: true });
        conversionApi.consumable.consume(data.viewItem, { attributes: "data-xlink-href" });

        conversionApi.updateConversionResult(imageInline, data);
      },
      { priority: "high" },
    );
  };

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
  } catch (e: unknown) {
    // toUriPath() might throw an exception, but an unresolvable
    // uriPath should not result in an error, which would break the editor.
    // Therefore: Return early. An endless loading spinner will be displayed as a result.
    logger.debug("Cannot resolve valid uriPath from xlink-href attribute:", xlinkHref, e);
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
  editor.editing.view.change((writer: ViewDowncastWriter) => {
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
