import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkTarget from "@coremedia/ckeditor5-link/linktarget/LinkTarget";
import ContentLinks from "@coremedia/ckeditor5-link/contentlink/ContentLinks";
import CoreMediaRichText from "@coremedia/ckeditor5-coremedia-richtext/CoreMediaRichText";

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
    return [LinkTarget, ContentLinks, CoreMediaRichText];
  }
}
