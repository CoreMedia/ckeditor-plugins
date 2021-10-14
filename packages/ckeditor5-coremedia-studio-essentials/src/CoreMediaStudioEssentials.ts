import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkTarget from "@coremedia/ckeditor5-coremedia-link/linktarget/LinkTarget";
import ContentLinks from "@coremedia/ckeditor5-coremedia-link/contentlink/ContentLinks";
import CoreMediaRichText from "@coremedia/ckeditor5-coremedia-richtext/CoreMediaRichText";
import ContentClipboard from "@coremedia/ckeditor5-coremedia-blobs/clipboard/ContentClipboard";

/**
 * Essential editing features for CKEditor 5 in the CoreMedia Studio wrapped in one plugin.
 *
 * The CoreMediaStudioEssentials Plugin exposed by this package enables the following features:
 *
 * - Link targets on external links
 * - Content links
 * - CoreMedia RichText
 *
 */
export default class CoreMediaStudioEssentials extends Plugin {
  static readonly pluginName: string = "CoreMediaStudioEssentials";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [LinkTarget, ContentLinks, CoreMediaRichText, ContentClipboard];
  }
}

export { COREMEDIA_RICHTEXT_CONFIG_KEY } from "@coremedia/ckeditor5-coremedia-richtext/CoreMediaRichTextConfig";
export { Strictness } from "@coremedia/ckeditor5-coremedia-richtext/RichTextSchema";
