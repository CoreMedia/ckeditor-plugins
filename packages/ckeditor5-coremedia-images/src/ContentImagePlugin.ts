import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import ContentImageEditingPlugin from "./ContentImageEditingPlugin";
import ContentImageClipboardPlugin from "./ContentImageClipboardPlugin";

/**
 * This is a glue plugin....
 */
export default class ContentImagePlugin extends Plugin {
  static readonly pluginName: string = "ContentImagePlugin";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [ContentImageEditingPlugin, ContentImageClipboardPlugin];
  }
}
