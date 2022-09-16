import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ContentImageEditingPlugin from "./ContentImageEditingPlugin";
import ContentImageClipboardPlugin from "./ContentImageClipboardPlugin";

/**
 * Aggregator plugin for `ContentImageEditingPlugin` and
 * `ContentImageClipboardPlugin`.
 */
export default class ContentImagePlugin extends Plugin {
  static readonly pluginName: string = "ContentImagePlugin";

  static readonly requires = [ContentImageEditingPlugin, ContentImageClipboardPlugin];
}
