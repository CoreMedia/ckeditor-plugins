import { Plugin } from "ckeditor5";
import ContentImageEditingPlugin from "./ContentImageEditingPlugin";
import ContentImageClipboardPlugin from "./ContentImageClipboardPlugin";
import ContentImageOpenInTabUI from "./contentImageOpenInTab/ContentImageOpenInTabUI";

/**
 * Aggregator plugin for `ContentImageEditingPlugin` and
 * `ContentImageClipboardPlugin`.
 */
export default class ContentImagePlugin extends Plugin {
  static readonly pluginName = "ContentImagePlugin" as const;
  static readonly requires = [ContentImageOpenInTabUI, ContentImageEditingPlugin, ContentImageClipboardPlugin];
}
