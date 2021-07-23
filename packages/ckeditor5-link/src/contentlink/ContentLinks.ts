import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import LinkEditing from "@ckeditor/ckeditor5-link/src/linkediting";
import ContentLinkActionsViewExtension from "./ui/ContentLinkActionsViewExtension";
import ContentLinkFormViewExtension from "./ui/ContentLinkFormViewExtension";
import { CONTENT_CKE_MODEL_URI_REGEXP } from "@coremedia/coremedia-studio-integration/content/UriPath";

/**
 * This plugin allows content objects to be dropped into the link dialog.
 * Content Links will be displayed as a content item.
 *
 */
export default class ContentLinks extends Plugin {
  static readonly pluginName: string = "ContentLinks";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [LinkUI, LinkEditing, ContentLinkActionsViewExtension, ContentLinkFormViewExtension];
  }

  init(): Promise<void> | null {
    const editor = this.editor;
    const linkCommand = editor.commands.get("link");
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);

    linkUI.set({
      contentUriPath: undefined,
    });

    /*
     * Listen to changes of linkCommand (just like the url input field does)
     * If the value represents a content, we'll set the content link field value
     */
    linkUI.bind("contentUriPath").to(linkCommand, "value", (value: string) => {
      return CONTENT_CKE_MODEL_URI_REGEXP.test(value) ? value : undefined;
    });

    return null;
  }
}
