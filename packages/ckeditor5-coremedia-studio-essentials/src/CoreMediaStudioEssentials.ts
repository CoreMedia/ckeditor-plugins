import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import CoreMediaRichText from "@coremedia/ckeditor5-coremedia-richtext/CoreMediaRichText";
import GeneralRichTextSupport from "@coremedia/ckeditor5-coremedia-richtext-support/GeneralRichTextSupport";

/**
 * Essential editing features for CKEditor 5 in the CoreMedia Studio wrapped in one plugin.
 *
 * The CoreMediaStudioEssentials Plugin exposed by this package enables the following features:
 *
 * * CoreMedia RichText
 * * CoreMedia General RichText Support
 *
 */
export default class CoreMediaStudioEssentials extends Plugin {
  static readonly pluginName: string = "CoreMediaStudioEssentials";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [CoreMediaRichText, GeneralRichTextSupport];
  }
}

export { COREMEDIA_RICHTEXT_CONFIG_KEY } from "@coremedia/ckeditor5-coremedia-richtext/CoreMediaRichTextConfig";
export { Strictness } from "@coremedia/ckeditor5-coremedia-richtext/RichTextSchema";
export { COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY } from "@coremedia/ckeditor5-coremedia-richtext-support/CoreMediaRichTextSupportConfig";
