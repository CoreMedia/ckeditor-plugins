import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

export class ImageElementSupport extends Plugin {
  static readonly pluginName: string = "DifferencingImageElementSupport";
  static readonly requires = [];

  init(): void {
    const { editor } = this;
    const { model } = editor;
    const { schema } = model;

    // At least one image plugin should be loaded for the integration to work properly.
    if (!editor.plugins.has("ImageInlineEditing") && !editor.plugins.has("ImageBlockEditing")) {
      return;
    }
    if (schema.isRegistered("imageBlock")) {
      schema.extend("imageBlock", {
        allowAttributes: ["changeType"],
      });
    }

    if (schema.isRegistered("imageInline")) {
      schema.extend("imageInline", {
        allowAttributes: ["changeType"],
      });
    }
  }
}
