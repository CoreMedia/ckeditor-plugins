import { Editor, Plugin } from "@ckeditor/ckeditor5-core";
import { getOptionalPlugin, reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import ImageUtils from "@ckeditor/ckeditor5-image/src/imageutils";
import { DowncastAttributeEvent, DowncastDispatcher, Element } from "@ckeditor/ckeditor5-engine";
import { GetCallback } from "@ckeditor/ckeditor5-utils";
import { editingDowncastXlinkHref } from "../converters";
import {
  IMAGE_BLOCK_MODEL_ELEMENT_NAME,
  XLINK_HREF_DATA_VIEW_ATTRIBUTE_NAME,
  XLINK_HREF_MODEL_ATTRIBUTE_NAME,
} from "./ImageEditing";
import { Logger, LoggerProvider } from "@coremedia/ckeditor5-logging";
import ModelBoundSubscriptionPlugin from "../ModelBoundSubscriptionPlugin";

/**
 * Integration to CKEditor 5 `ImageBlockEditing` plugin.
 */
export class ImageBlockEditing extends Plugin {
  static readonly pluginName = "CoreMediaImageBlockEditingIntegration";
  static readonly requires = [ImageUtils];
  static readonly #logger: Logger = LoggerProvider.getLogger(ImageBlockEditing.pluginName);

  /**
   * Initializes the plugin. Using `afterInit`, as we need to ensure that
   * a possibly installed `ImageBlockEditing` plugin got initialized first.
   */
  afterInit(): void {
    const initInformation = reportInitStart(this);
    const {
      editor: { plugins },
    } = this;

    if (plugins.has("ImageBlockEditing")) {
      this.#conditionalAfterInit();
    }

    reportInitEnd(initInformation);
  }

  #conditionalAfterInit(): void {
    const {
      editor: {
        model: { schema },
      },
    } = this;

    schema.extend(IMAGE_BLOCK_MODEL_ELEMENT_NAME, {
      allowAttributes: [XLINK_HREF_MODEL_ATTRIBUTE_NAME],
    });

    this.#setupConversion();
  }

  #setupConversion() {
    const {
      editor: { conversion, plugins },
    } = this;

    const imageUtils = plugins.get(ImageUtils);

    conversion
      .for("editingDowncast")
      .add(editingDowncastXlinkHref(this.editor, IMAGE_BLOCK_MODEL_ELEMENT_NAME, ImageBlockEditing.#logger));

    conversion.for("dataDowncast").add(downcastXlinkHrefAttribute(imageUtils));

    ImageBlockEditing.#initializeModelBoundSubscriptionPlugin(this.editor);
  }

  /**
   * Register `imageBlock` model elements for subscription cleanup
   * on model changes.
   */
  static #initializeModelBoundSubscriptionPlugin(editor: Editor): void {
    const subscriptionPlugin = getOptionalPlugin(editor, ModelBoundSubscriptionPlugin);

    if (!subscriptionPlugin) {
      return;
    }

    subscriptionPlugin.registerModelElement(IMAGE_BLOCK_MODEL_ELEMENT_NAME);
  }
}

const downcastXlinkHrefAttribute = (imageUtils: ImageUtils): ((dispatcher: DowncastDispatcher) => void) => {
  const converter: GetCallback<DowncastAttributeEvent<Element>> = (evt, data, conversionApi) => {
    if (!conversionApi.consumable.consume(data.item, evt.name)) {
      return;
    }

    const writer = conversionApi.writer;
    const element = conversionApi.mapper.toViewElement(data.item);
    if (!element) {
      return;
    }

    const img = imageUtils.findViewImgElement(element);
    if (!img) {
      return;
    }

    if (data.attributeNewValue) {
      writer.setAttribute(XLINK_HREF_DATA_VIEW_ATTRIBUTE_NAME, data.attributeNewValue, img);
    }
  };

  return (dispatcher) => {
    dispatcher.on<DowncastAttributeEvent<Element>>(
      `attribute:${XLINK_HREF_MODEL_ATTRIBUTE_NAME}:${IMAGE_BLOCK_MODEL_ELEMENT_NAME}`,
      converter,
    );
  };
};
