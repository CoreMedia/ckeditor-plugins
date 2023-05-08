import { Plugin, Editor } from "@ckeditor/ckeditor5-core";
import { editingDowncastXlinkHref, preventUpcastImageSrc } from "./converters";
// ImageUtils: See ckeditor/ckeditor5#12027.
import ImageUtils from "@ckeditor/ckeditor5-image/src/imageutils";
// ImageInline: See ckeditor/ckeditor5#12027.
import ImageInline from "@ckeditor/ckeditor5-image/src/imageinline";
import ModelBoundSubscriptionPlugin from "./ModelBoundSubscriptionPlugin";
import { getOptionalPlugin, reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";
import { OpenInTabCommand } from "@coremedia/ckeditor5-coremedia-content/src/commands/OpenInTabCommand";
import Logger from "@coremedia/ckeditor5-logging/src/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";

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
  static readonly openImageInTab = "openImageInTab" as const;
  static readonly #logger: Logger = LoggerProvider.getLogger(ContentImageEditingPlugin.pluginName);

  static readonly IMAGE_INLINE_MODEL_ELEMENT_NAME = "imageInline";
  static readonly IMAGE_INLINE_VIEW_ELEMENT_NAME = "img";
  static readonly XLINK_HREF_MODEL_ATTRIBUTE_NAME = "xlink-href";
  static readonly XLINK_HREF_DATA_ATTRIBUTE_NAME = "data-xlink-href";

  static readonly requires = [ImageInline, ImageUtils, ModelBoundSubscriptionPlugin];

  init(): void {
    const editor = this.editor;
    const initInformation = reportInitStart(this);
    editor.commands.add(
      ContentImageEditingPlugin.openImageInTab,
      new OpenInTabCommand(editor, "xlink-href", "imageInline")
    );
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
    ContentImageEditingPlugin.#initializeModelBoundSubscriptionPlugin(this.editor);
    ContentImageEditingPlugin.#setupXlinkHrefConversion(
      this.editor,
      ContentImageEditingPlugin.XLINK_HREF_MODEL_ATTRIBUTE_NAME,
      ContentImageEditingPlugin.XLINK_HREF_DATA_ATTRIBUTE_NAME
    );

    // We have to prevent writing src-attribute to model because we fetch the
    // src attribute for the editing view asynchronously.
    // If not prevented, the src-attribute from GRS would be written to the model.
    this.editor.conversion.for("upcast").add(preventUpcastImageSrc());
  }

  static #setupXlinkHrefConversion(editor: Editor, modelAttributeName: string, dataAttributeName: string): void {
    ContentImageEditingPlugin.#setupXlinkHrefConversionDowncast(
      editor,
      ContentImageEditingPlugin.IMAGE_INLINE_MODEL_ELEMENT_NAME,
      modelAttributeName,
      dataAttributeName
    );
    editor.conversion.for("upcast").attributeToAttribute({
      model: modelAttributeName,
      view: { name: ContentImageEditingPlugin.IMAGE_INLINE_VIEW_ELEMENT_NAME, key: dataAttributeName },
    });
  }

  static #setupXlinkHrefConversionDowncast(
    editor: Editor,
    modelElementName: "imageInline",
    modelAttributeName: string,
    dataAttributeName: string
  ): void {
    editor.model.schema.extend(modelElementName, {
      allowAttributes: [modelAttributeName],
    });
    editor.conversion.for("dataDowncast").attributeToAttribute({
      model: {
        name: modelElementName,
        key: modelAttributeName,
      },
      view: dataAttributeName,
    });

    // For editing-view, the xlink-href attribute has to be converted to a src-attribute.
    editor.conversion
      .for("editingDowncast")
      .add(editingDowncastXlinkHref(editor, modelElementName, ContentImageEditingPlugin.#logger));
  }

  /**
   * Register `imageInline` model elements for subscription cleanup
   * on model changes.
   *
   * @param editor - Editor
   */
  static #initializeModelBoundSubscriptionPlugin(editor: Editor): void {
    getOptionalPlugin(editor, ModelBoundSubscriptionPlugin)?.registerModelElement(
      ContentImageEditingPlugin.IMAGE_INLINE_MODEL_ELEMENT_NAME
    );
  }
}
