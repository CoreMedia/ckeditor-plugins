import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { editingDowncastXlinkHref, preventUpcastImageSrc } from "./converters";
import ImageUtils from "@ckeditor/ckeditor5-image/src/imageutils";
import ModelBoundSubscriptionPlugin from "./ModelBoundSubscriptionPlugin";
import ImageInline from "@ckeditor/ckeditor5-image/src/imageinline";
import { ifPlugin, optionalPluginNotFound, reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import { OpenInTabCommand } from "@coremedia/ckeditor5-content/commands/OpenInTabCommand";

/**
 * Plugin to support images from CoreMedia RichText.
 *
 * The plugin takes the `xlink:href` represented in the data-view by
 * `data-xlink-href` and writes it to the model.
 *
 * The model attribute afterwards will be downcast to the editing-view where it
 * is represented by the src-attribute of the `img`-tag.
 */
export default class ContentImageEditingPlugin extends Plugin {
  static readonly pluginName: string = "ContentImageEditingPlugin";

  static readonly IMAGE_INLINE_MODEL_ELEMENT_NAME = "imageInline";
  static readonly IMAGE_INLINE_VIEW_ELEMENT_NAME = "img";
  static readonly XLINK_HREF_MODEL_ATTRIBUTE_NAME = "xlink-href";
  static readonly XLINK_HREF_DATA_ATTRIBUTE_NAME = "data-xlink-href";

  static readonly requires = [ImageInline, ImageUtils, ModelBoundSubscriptionPlugin];

  async init(): Promise<void> {
    const editor = this.editor;
    const initInformation = reportInitStart(this);
    editor.commands.add("openImageInTab", new OpenInTabCommand(editor, "xlink-href", "imageInline"));
    editor.commands.add("openLinkInTab", new OpenInTabCommand(editor, "linkHref"));
    reportInitEnd(initInformation);
  }

  /**
   * Registers support for the `xlink:href` attribute for element `img` in
   * RichText.
   *
   * `xlink:href` is represented in the data-view as `data-xlink-href` and in
   * model as `xlink-href`. When downcast to the editing-view it will be
   * resolved to the image src-attribute by fetching the URL from the
   * `BlobDisplayService`
   */
  async afterInit(): Promise<void> {
    await ContentImageEditingPlugin.#initializeModelBoundSubscriptionPlugin(this.editor);
    ContentImageEditingPlugin.#setupXlinkHrefConversion(
      this.editor,
      ContentImageEditingPlugin.XLINK_HREF_MODEL_ATTRIBUTE_NAME,
      ContentImageEditingPlugin.XLINK_HREF_DATA_ATTRIBUTE_NAME
    );

    // We have to prevent to write src-attribute to model because we fetch the
    // src attribute for the editing view asynchronously.
    // If not prevented the src-attribute from GRS would be written to the model.
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
      // @ts-expect-error TODO Validate with typings from DefinitelyTyped
      model: {
        name: modelElementName,
        key: modelAttributeName,
      },
      view: dataAttributeName,
    });

    //For editing-view the xlink-href attribute has to be converted to a src-attribute.
    editor.conversion.for("editingDowncast").add(editingDowncastXlinkHref(editor, modelElementName));
  }

  /**
   * Register `imageInline` model elements for subscription cleanup
   * on model changes.
   *
   * @param editor - Editor
   */
  static async #initializeModelBoundSubscriptionPlugin(editor: Editor): Promise<void> {
    await ifPlugin(editor, ModelBoundSubscriptionPlugin)
      .then((plugin) => plugin.registerModelElement(ContentImageEditingPlugin.IMAGE_INLINE_MODEL_ELEMENT_NAME))
      .catch(optionalPluginNotFound);
  }
}
