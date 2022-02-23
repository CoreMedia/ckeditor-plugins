import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { editingDowncastXlinkHref, preventUpcastImageSrc } from "./converters";
import ImageUtils from "@ckeditor/ckeditor5-image/src/imageutils";
import ModelBoundSubscriptionPlugin from "./ModelBoundSubscriptionPlugin";
import { imageInlineElementToElementConversionPatch } from "./patches";
import ImageInline from "@ckeditor/ckeditor5-image/src/imageinline";

export default class ContentImageEditingPlugin extends Plugin {
  static readonly pluginName: string = "ContentImageEditingPlugin";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [ImageInline, ImageUtils, ModelBoundSubscriptionPlugin];
  }

  afterInit(): null {
    const subscriptionPlugin = <ModelBoundSubscriptionPlugin>(
      this.editor.plugins.get(ModelBoundSubscriptionPlugin.PLUGIN_NAME)
    );
    if (subscriptionPlugin) {
      subscriptionPlugin.registerModelElement("imageInline");
    }
    ContentImageEditingPlugin.#setupXlinkHrefConversion(this.editor, "xlink-href", "data-xlink-href");
    imageInlineElementToElementConversionPatch(this.editor);

    // We have to prevent to write src-attribute to model because we fetch the src attribute for the editing view asynchronously.
    // If not prevented the src-attribute from GRS would be written to the model.
    this.editor.conversion.for("upcast").add(preventUpcastImageSrc());
    return null;
  }

  static #setupXlinkHrefConversion(editor: Editor, modelAttributeName: string, dataAttributeName: string): void {
    this.#setupXlinkHrefConversionDowncast(editor, "imageInline", modelAttributeName, dataAttributeName);
    editor.conversion.for("upcast").attributeToAttribute({
      model: modelAttributeName,
      view: { name: "img", key: dataAttributeName },
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
    editor.conversion
      .for("editingDowncast")
      .add(editingDowncastXlinkHref(editor, modelElementName, modelAttributeName));
  }
}
