import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { editingDowncastXlinkHref, preventUpcastImageSrc } from "./converters";
import ImageUtils from "@ckeditor/ckeditor5-image/src/imageutils";
import ModelBoundSubscriptionPlugin from "./ModelBoundSubscriptionPlugin";
import { imageInlineElementToElementConversionPatch } from "./patches";
import ImageInline from "@ckeditor/ckeditor5-image/src/imageinline";

export default class ContentImageEditingPlugin extends Plugin {
  static readonly pluginName: string = "ContentImageEditingPlugin";
  static readonly IMAGE_INLINE_MODEL_ELEMENT_NAME = "imageInline";
  static readonly IMAGE_INLINE_VIEW_ELEMENT_NAME = "img";
  static readonly XLINK_HREF_MODEL_ATTRIBUTE_NAME = "xlink-href";
  static readonly XLINK_HREF_DATA_ATTRIBUTE_NAME = "data-xlink-href";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [ImageInline, ImageUtils, ModelBoundSubscriptionPlugin];
  }

  /**
   * Registers support for the `xlink:href` attribute for element `img` in richtext.
   * `xlink:href` is represented in the data-view as `data-xlink-href` and in model as `xlink-href`.
   * When downcasted to the editing-view it will be resolved to the image src-attribute by fetching the url from the `BlobDisplayService`
   */
  afterInit(): null {
    ContentImageEditingPlugin.#initializeModelBoundSubscriptionPlugin(this.editor);
    ContentImageEditingPlugin.#setupXlinkHrefConversion(
      this.editor,
      ContentImageEditingPlugin.XLINK_HREF_MODEL_ATTRIBUTE_NAME,
      ContentImageEditingPlugin.XLINK_HREF_DATA_ATTRIBUTE_NAME
    );
    imageInlineElementToElementConversionPatch(this.editor);

    // We have to prevent to write src-attribute to model because we fetch the src attribute for the editing view asynchronously.
    // If not prevented the src-attribute from GRS would be written to the model.
    this.editor.conversion.for("upcast").add(preventUpcastImageSrc());
    return null;
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

    //For editing-view the xlink-href attribute has to be converted to a src-attribute.
    editor.conversion.for("editingDowncast").add(editingDowncastXlinkHref(editor, modelElementName));
  }

  /**
   * Register <code>imageInline</code> model elements for subscription cleanup on model changes.
   *
   * @param editor - Editor
   * @private
   */
  static #initializeModelBoundSubscriptionPlugin(editor: Editor): void {
    const subscriptionPlugin = <ModelBoundSubscriptionPlugin>(
      editor.plugins.get(ModelBoundSubscriptionPlugin.PLUGIN_NAME)
    );
    if (subscriptionPlugin) {
      subscriptionPlugin.registerModelElement("imageInline");
    }
  }
}
