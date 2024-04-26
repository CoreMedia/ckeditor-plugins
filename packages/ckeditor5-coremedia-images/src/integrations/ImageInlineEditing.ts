import { Editor, Plugin } from "@ckeditor/ckeditor5-core";
import { getOptionalPlugin, reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import ImageUtils from "@ckeditor/ckeditor5-image/src/imageutils";
import { downcastImageAttribute } from "@ckeditor/ckeditor5-image/src/image/converters";
import {
  IMAGE_INLINE_MODEL_ELEMENT_NAME,
  XLINK_HREF_DATA_VIEW_ATTRIBUTE_NAME,
  XLINK_HREF_MODEL_ATTRIBUTE_NAME,
} from "./ImageEditing";
import { editingDowncastXlinkHref } from "../converters";
import { Logger, LoggerProvider } from "@coremedia/ckeditor5-logging";
import ModelBoundSubscriptionPlugin from "../ModelBoundSubscriptionPlugin";

/**
 * Integration to CKEditor 5 `ImageInlineEditing` plugin.
 */
export class ImageInlineEditing extends Plugin {
  static readonly pluginName = "CoreMediaImageInlineEditingIntegration";
  static readonly requires = [ImageUtils];
  static readonly #logger: Logger = LoggerProvider.getLogger(ImageInlineEditing.pluginName);

  /**
   * Initializes the plugin. Using `afterInit`, as we need to ensure that
   * a possibly installed `ImageInlineEditing` plugin got initialized first.
   */
  afterInit(): void {
    const initInformation = reportInitStart(this);
    const {
      editor: { plugins },
    } = this;

    if (plugins.has("ImageInlineEditing")) {
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

    schema.extend(IMAGE_INLINE_MODEL_ELEMENT_NAME, {
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
      .for("downcast")
      .add(downcastImageAttribute(imageUtils, IMAGE_INLINE_MODEL_ELEMENT_NAME, XLINK_HREF_DATA_VIEW_ATTRIBUTE_NAME));

    conversion
      .for("editingDowncast")
      .add(editingDowncastXlinkHref(this.editor, IMAGE_INLINE_MODEL_ELEMENT_NAME, ImageInlineEditing.#logger));

    conversion.for("dataDowncast").attributeToAttribute({
      model: {
        name: IMAGE_INLINE_MODEL_ELEMENT_NAME,
        key: XLINK_HREF_MODEL_ATTRIBUTE_NAME,
      },
      view: XLINK_HREF_DATA_VIEW_ATTRIBUTE_NAME,
    });

    ImageInlineEditing.#initializeModelBoundSubscriptionPlugin(this.editor);
  }

  /**
   * Register `imageInline` model elements for subscription cleanup
   * on model changes.
   */
  static #initializeModelBoundSubscriptionPlugin(editor: Editor): void {
    const subscriptionPlugin = getOptionalPlugin(editor, ModelBoundSubscriptionPlugin);

    if (!subscriptionPlugin) {
      return;
    }

    subscriptionPlugin.registerModelElement(IMAGE_INLINE_MODEL_ELEMENT_NAME);
  }
}
