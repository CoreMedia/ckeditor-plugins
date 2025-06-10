import LinkTargetModelView from "./LinkTargetModelView";
import { Plugin, Link, Editor, ToolbarConfig } from "ckeditor5";
import LinkTargetActionsViewExtension from "./LinkTargetActionsViewExtension";
import "../lang/linktarget";
import { CONTENT_LINK_VIEW_COMPONENT_NAME } from "../contentlink/ui/ContentLinkActionsViewExtension";

const CKEDITOR_LINK_PREVIEW_COMPONENT_NAME = "linkPreview";
/**
 * Adds an attribute `linkTarget` to the model, which will be represented
 * as `target` attribute in view.
 *
 * @see {@link https://stackoverflow.com/questions/51303892/how-to-add-target-attribute-to-a-tag-in-ckeditor5 | How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow}
 */
export default class LinkTarget extends Plugin {
  public static readonly pluginName = "LinkTarget" as const;
  static readonly requires = [Link, LinkTargetModelView, LinkTargetActionsViewExtension];

  constructor(editor: Editor) {
    super(editor);
    this.#addContentLinkButtonToLinkConfig(editor);
  }

  /**
   * This method changes the `link.toolbar` configuration, defined by the ckeditor5-link plugin,
   * by adding the linkPreview substitute for internal links: The contentLinkView.
   * There are a few exceptions, though:
   * * The contentLinkView will not be added, if already present
   * * The contentLinkView will not be added, if the linkPreview was removed
   *
   * How the `link.toolbar` configuration is set:  First, the editor holds
   * a configuration, that is set when it is instantiated. Then the ckeditor5-link plugin is loaded,
   * which sets a default configuration if none is present yet.
   * Afterward, this plugin might change the configuration by adding the contentLinkView.
   *
   * @param editor - the editor
   * @private
   */
  #addContentLinkButtonToLinkConfig(editor: Editor) {
    const toolbarConfig = editor.config.get("link.toolbar");
    if (!toolbarConfig) {
      return;
    }

    const contentLinkViewIndex = this.#getFirstIndexOfConfigStringEntry(
      toolbarConfig,
      CONTENT_LINK_VIEW_COMPONENT_NAME,
    );
    if (contentLinkViewIndex > -1) {
      // contentLinkViewIndex already present in config. no need to add
      return;
    }
    const linkPreviewIndex = this.#getFirstIndexOfConfigStringEntry(
      toolbarConfig,
      CKEDITOR_LINK_PREVIEW_COMPONENT_NAME,
    );
    if (linkPreviewIndex > -1) {
      const newToolbarConfig = toolbarConfig;
      if (Array.isArray(newToolbarConfig)) {
        newToolbarConfig.splice(linkPreviewIndex, 0, CONTENT_LINK_VIEW_COMPONENT_NAME);
        editor.config.set("link", {
          toolbar: newToolbarConfig,
        });
      }
    }
  }

  #getFirstIndexOfConfigStringEntry(toolbarConfig: ToolbarConfig, entryName: string): number {
    if (Array.isArray(toolbarConfig)) {
      for (let i = 0; i <= toolbarConfig.length; i++) {
        const entry = toolbarConfig[i];
        if (typeof entry === "string") {
          if (entry === entryName) {
            return i;
          }
        }
      }
    }
    return -1;
  }
}
