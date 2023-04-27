import { Plugin } from "@ckeditor/ckeditor5-core";
import CoreMediaRichText from "@coremedia/ckeditor5-coremedia-richtext/src/CoreMediaRichText";
import GeneralRichTextSupport from "@coremedia/ckeditor5-coremedia-richtext-support/src/GeneralRichTextSupport";

/**
 * Essential editing features for CKEditor 5 in the CoreMedia Studio wrapped in one plugin.
 *
 * The CoreMediaStudioEssentials Plugin exposed by this package enables the following features:
 *
 * * {@link ckeditor5-coremedia-richtext.CoreMediaRichText CoreMedia RichText}
 * * {@link ckeditor5-coremedia-richtext-support.GeneralRichTextSupport CoreMedia General RichText Support}
 */
export default class CoreMediaStudioEssentials extends Plugin {
  public static readonly pluginName = "CoreMediaStudioEssentials" as const;

  static readonly requires = [CoreMediaRichText, GeneralRichTextSupport];
}

export { COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY } from "@coremedia/ckeditor5-coremedia-richtext-support/src/CoreMediaRichTextSupportConfig";
export { Strictness } from "@coremedia/ckeditor5-coremedia-richtext/src/Strictness";
export { COREMEDIA_RICHTEXT_CONFIG_KEY } from "@coremedia/ckeditor5-coremedia-richtext/src/CoreMediaRichTextConfig";
