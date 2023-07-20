/* eslint no-null/no-null: off */

import { Plugin } from "@ckeditor/ckeditor5-core";
import { LINK_TARGET_MODEL, LINK_TARGET_VIEW } from "./Constants";
import LinkTargetCommand from "./command/LinkTargetCommand";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";
import { getLinkAttributes, LinkAttributes } from "@coremedia/ckeditor5-link-common/src/LinkAttributes";
import { Range } from "@ckeditor/ckeditor5-engine";
import { computeDefaultLinkTargetForUrl } from "./config/LinkTargetConfig";

/**
 * Adds an attribute `linkTarget` to the model, which will be represented
 * as `target` attribute in view.
 *
 * @see {@link https://stackoverflow.com/questions/51303892/how-to-add-target-attribute-to-a-tag-in-ckeditor5 | How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow}
 */
export default class LinkTargetModelView extends Plugin {
  public static readonly pluginName = "LinkTargetModelView" as const;

  // LinkUI: Registers the commands, which are expected to set/unset `linkHref`
  static readonly requires = [LinkAttributes];

  /**
   * Defines `linkTarget` model-attribute, which is represented on downcast
   * (to data and for editing) as `target` attribute.
   *
   * Also registers a postFixer to change the default link target like specified
   * in the editor config.
   */
  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);

    const { editor } = this;

    getLinkAttributes(editor)?.registerAttribute({
      model: LINK_TARGET_MODEL,
      view: LINK_TARGET_VIEW,
    });

    editor.commands.add("linkTarget", new LinkTargetCommand(editor));

    // This function, as well as the postFixer are used to apply default link targets to links in the editor.
    const addLinkTarget = (linkTarget: string, range: Range) => {
      this.editor.model.change((writer) => {
        writer.setAttribute("linkTarget", linkTarget, range);
      });
    };

    this.editor.model.document.registerPostFixer((writer) => {
      const changes = this.editor.model.document.differ.getChanges();

      for (const entry of changes) {
        if (entry.type === "attribute" && entry.attributeKey === "linkHref") {
          // The linkHref attribute was added/changed for this node
          // This might happen if an existing link gets edited e.g. if the link url gets changed.
          const linkTarget = computeDefaultLinkTargetForUrl(entry.attributeNewValue as string, this.editor.config);
          if (!linkTarget) {
            continue;
          }
          addLinkTarget(linkTarget, entry.range);
        } else if (entry.type === "insert" && entry.attributes.has("linkHref")) {
          // An entry with linkHref attribute was inserted
          // This applies to links, created via the link balloon and contents dropped into the
          // editor or into the link balloon
          const linkTarget = computeDefaultLinkTargetForUrl(
            entry.attributes.get("linkHref") as string,
            this.editor.config
          );
          if (!linkTarget) {
            continue;
          }

          const { position: start } = entry;
          const end = start.getShiftedBy(entry.length);
          const range = writer.createRange(start, end);

          addLinkTarget(linkTarget, range);
        }
      }
      return false;
    });

    reportInitEnd(initInformation);
  }
}
