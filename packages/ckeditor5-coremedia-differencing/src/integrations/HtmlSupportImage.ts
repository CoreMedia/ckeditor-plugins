import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

export class HtmlImageElementSupport extends Plugin {
  static readonly pluginName: string = "DifferencingHtmlImageElementSupport";
  static readonly requires = [];

  init(): void {
    const { editor } = this;
    const { model } = editor;
    const { schema } = model;

    // Only required, if no standard image plugin is enabled.
    if (editor.plugins.has("ImageInlineEditing") || editor.plugins.has("ImageBlockEditing")) {
      console.log("HtmlImageElementSupport: Irrelevant: Image Plugins available.");
      return;
    }
    // Skip, if GHS is not enabled, i.e., required contained DataSchema plugin is not available.
    if (!editor.plugins.has("DataSchema")) {
      console.log("HtmlImageElementSupport: Irrelevant: DataSchema plugin unavailable.");
      return;
    }
    /*
       TODO: We must wait here, for 'htmlImg'  to be registered. See possibly
       HTML Support, Image Integration and dataFilter.on( 'register:img', ( evt, definition )
       We may be able, adding attributes there.
     */
    if (schema.isRegistered("htmlImg")) {
      schema.extend("htmlImg", {
        allowAttributes: ["changeType"],
      });
    } else {
      console.log("HtmlImageElementSupport: htmlImg element not (yet?) registered");
    }
  }
}
