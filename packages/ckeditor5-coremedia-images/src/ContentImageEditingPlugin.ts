import { Plugin, Editor } from "@ckeditor/ckeditor5-core";
import { editingDowncastXlinkHref } from "./converters";
// ImageUtils: See ckeditor/ckeditor5#12027.
import ImageUtils from "@ckeditor/ckeditor5-image/src/imageutils";
import ModelBoundSubscriptionPlugin from "./ModelBoundSubscriptionPlugin";
import { getOptionalPlugin, reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";
import Logger from "@coremedia/ckeditor5-logging/src/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import {
  openImageInTabCommandName,
  registerOpenImageInTabCommand,
} from "./contentImageOpenInTab/OpenImageInTabCommand";
import { Image } from "@ckeditor/ckeditor5-image";

/**
 * Plugin to support images from CoreMedia RichText.
 *
 * The plugin takes the `xlink:href` represented in the data-view by
 * `data-xlink-href` and writes it to the model.
 *
 * The model attribute afterward will be downcast to the editing-view where it
 * is represented by the src-attribute of the `img`-tag.
 */
export default class ContentImageEditingPlugin extends Plugin {
  static readonly pluginName = "ContentImageEditingPlugin" as const;
  /**
   * Command name for bound `openImageInTab`.
   */
  static readonly openImageInTab = openImageInTabCommandName;
  static readonly #logger: Logger = LoggerProvider.getLogger(ContentImageEditingPlugin.pluginName);

  static readonly IMAGE_INLINE_MODEL_ELEMENT_NAME = "imageInline";
  static readonly IMAGE_BLOCK_MODEL_ELEMENT_NAME = "imageBlock";
  static readonly IMAGE_INLINE_VIEW_ELEMENT_NAME = "img";
  static readonly XLINK_HREF_MODEL_ATTRIBUTE_NAME = "xlink-href";
  static readonly XLINK_HREF_DATA_ATTRIBUTE_NAME = "data-xlink-href";

  static readonly requires = [Image, ImageUtils, ModelBoundSubscriptionPlugin];

  init(): void {
    const editor = this.editor;
    const initInformation = reportInitStart(this);
    registerOpenImageInTabCommand(editor);
    reportInitEnd(initInformation);
  }

  /**
   * Registers support for the `xlink:href` attribute for element `img` in
   * RichText.
   *
   * `xlink:href` is represented in the data-view as `data-xlink-href` and in
   * model as `xlink-href`. When downcast to the editing-view, it will be
   * resolved to the image src-attribute by fetching the URL from the
   * `BlobDisplayService`
   */
  afterInit(): void {
    const { editor } = this;

    const isBlockPluginLoaded = editor.plugins.has("ImageBlockEditing");
    const isInlinePluginLoaded = editor.plugins.has("ImageInlineEditing");

    ContentImageEditingPlugin.#initializeModelBoundSubscriptionPlugin(
      editor,
      isBlockPluginLoaded,
      isInlinePluginLoaded,
    );
    ContentImageEditingPlugin.#setupXlinkHrefConversion(
      editor,
      isBlockPluginLoaded,
      isInlinePluginLoaded,
      ContentImageEditingPlugin.XLINK_HREF_MODEL_ATTRIBUTE_NAME,
      ContentImageEditingPlugin.XLINK_HREF_DATA_ATTRIBUTE_NAME,
    );
  }

  static #setupXlinkHrefConversion(
    editor: Editor,
    isBlockPluginLoaded: boolean,
    isInlinePluginLoaded: boolean,
    modelAttributeName: string,
    dataAttributeName: string,
  ): void {
    ContentImageEditingPlugin.#setupXlinkHrefConversionDowncast(
      editor,
      isBlockPluginLoaded,
      isInlinePluginLoaded,
      modelAttributeName,
      dataAttributeName,
    );
    editor.conversion.for("upcast").attributeToAttribute({
      model: modelAttributeName,
      view: { name: ContentImageEditingPlugin.IMAGE_INLINE_VIEW_ELEMENT_NAME, key: dataAttributeName },
    });
  }

  static #setupXlinkHrefConversionDowncast(
    editor: Editor,
    isBlockPluginLoaded: boolean,
    isInlinePluginLoaded: boolean,
    modelAttributeName: string,
    dataAttributeName: string,
  ): void {
    const {
      conversion,
      model: { schema },
    } = editor;

    const modelElementNames: string[] = [];

    if (isBlockPluginLoaded) {
      modelElementNames.push(ContentImageEditingPlugin.IMAGE_BLOCK_MODEL_ELEMENT_NAME);
    }
    if (isInlinePluginLoaded) {
      modelElementNames.push(ContentImageEditingPlugin.IMAGE_INLINE_MODEL_ELEMENT_NAME);
    }

    for (const modelElementName of modelElementNames) {
      schema.extend(modelElementName, {
        allowAttributes: [modelAttributeName],
      });

      conversion.for("dataDowncast").attributeToAttribute({
        model: {
          name: modelElementName,
          key: modelAttributeName,
        },
        view: dataAttributeName,
      });

      // For editing-view, the xlink-href attribute has to be converted to a src-attribute.
      conversion
        .for("editingDowncast")
        .add(editingDowncastXlinkHref(editor, modelElementName, ContentImageEditingPlugin.#logger));
    }
  }

  /**
   * Register `imageInline` model elements for subscription cleanup
   * on model changes.
   */
  static #initializeModelBoundSubscriptionPlugin(
    editor: Editor,
    isBlockPluginLoaded: boolean,
    isInlinePluginLoaded: boolean,
  ): void {
    const subscriptionPlugin = getOptionalPlugin(editor, ModelBoundSubscriptionPlugin);

    if (!subscriptionPlugin) {
      return;
    }

    const modelElementNames: string[] = [];

    if (isBlockPluginLoaded) {
      modelElementNames.push(ContentImageEditingPlugin.IMAGE_BLOCK_MODEL_ELEMENT_NAME);
    }
    if (isInlinePluginLoaded) {
      modelElementNames.push(ContentImageEditingPlugin.IMAGE_INLINE_MODEL_ELEMENT_NAME);
    }

    modelElementNames.forEach((modelElementName) => subscriptionPlugin.registerModelElement(modelElementName));
  }
}
