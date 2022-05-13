/**
 * Creates an upcast converter that will pass all classes from the view element to the model element.
 */
import { DowncastConversionHelperFunction } from "@ckeditor/ckeditor5-engine/src/conversion/conversionhelpers";
import UpcastDispatcher, {
  UpcastConversionApi,
  UpcastEventData,
} from "@ckeditor/ckeditor5-engine/src/conversion/upcastdispatcher";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DowncastDispatcher, { DowncastEventData } from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
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
import { IMAGE_PLUGIN_NAME, IMAGE_SPINNER_CSS_CLASS, IMAGE_SPINNER_SVG } from "./constants";
import ModelBoundSubscriptionPlugin from "./ModelBoundSubscriptionPlugin";
import "../theme/loadmask.css";
import "./lang/contentimage";
import { ifPlugin, optionalPluginNotFound } from "@coremedia/ckeditor5-common/Plugins";

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

/**
 * Conversion for <code>modelElementName:xlink-href</code> to <code>img:src</code>
 *
 * @param editor - the editor instance
 * @param modelElementName - the element name to convert
 */
export const editingDowncastXlinkHref = (
  editor: Editor,
  modelElementName: string
): DowncastConversionHelperFunction => {
  return (dispatcher: DowncastDispatcher) => {
    dispatcher.on(`attribute:xlink-href:${modelElementName}`, (eventInfo: EventInfo, data: DowncastEventData): void => {
      onXlinkHrefEditingDowncast(editor, eventInfo, data);
    });
  };
};

const onXlinkHrefEditingDowncast = (editor: Editor, eventInfo: EventInfo, data: DowncastEventData): void => {
  const spinnerPreviewAttributes = createSpinnerImagePreviewAttributes(editor);
  updateImagePreviewAttributes(editor, data.item, spinnerPreviewAttributes, true);

  const xlinkHref = data.item.getAttribute("xlink-href");
  const uriPath: UriPath = toUriPath(xlinkHref);
  const property: string = toProperty(xlinkHref);
  serviceAgent
    .fetchService<BlobDisplayService>(new BlobDisplayServiceDescriptor())
    .then((blobDisplayService: BlobDisplayService) => blobDisplayService.observe_asInlinePreview(uriPath, property))
    .then(async (inlinePreviewObservable) => {
      const subscription = inlinePreviewObservable.subscribe((inlinePreview) => {
        updateImagePreviewAttributes(editor, data.item, inlinePreview, false);
      });
      await ifPlugin(editor, ModelBoundSubscriptionPlugin)
        .then((plugin) => plugin.addSubscription(data.item, subscription))
        .catch(optionalPluginNotFound);
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
  if (withSpinnerClass) {
    writeImageToView(editor, inlinePreview, imgTag, withSpinnerClass);
    return;
  }

  //preload the image. An image ca be multiple megabytes. Preloading ensures
  // that the spinner will stay until the image is loaded.
  const image = new Image();
  image.onload = () => writeImageToView(editor, inlinePreview, imgTag, withSpinnerClass);
  image.src = inlinePreview.thumbnailSrc;
};

const writeImageToView = (
  editor: Editor,
  inlinePreview: InlinePreview,
  imgTag: ViewElement,
  withSpinnerClass: boolean
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

const toProperty = (xlinkHref: string): string => {
  return xlinkHref.split("#")[1];
};

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
