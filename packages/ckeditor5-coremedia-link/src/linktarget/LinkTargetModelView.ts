/* eslint no-null/no-null: off */

import { Plugin } from "@ckeditor/ckeditor5-core";
import { LINK_TARGET_MODEL, LINK_TARGET_VIEW } from "./Constants";
import LinkTargetCommand from "./command/LinkTargetCommand";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";
import { getLinkAttributes, LinkAttributes } from "@coremedia/ckeditor5-link-common/src/LinkAttributes";
import { DiffItemAttribute, Range, Writer } from "@ckeditor/ckeditor5-engine";
import { computeDefaultLinkTargetForUrl } from "./config/LinkTargetConfig";
import { DiffItem, DiffItemInsert } from "@ckeditor/ckeditor5-engine/src/model/differ";

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

    /**
     * This function is used in the postFixer, registered further below.
     * The postFixer checks, if a change includes a link and computes the default link target.
     * Afterward, this function is called to apply the target to the link element in the model.
     *
     * @param linkTarget - the computed link target
     * @param range - the range of the changed element
     */
    const addLinkTarget = (linkTarget: string, range: Range) => {
      this.editor.model.change((writer) => {
        writer.setAttribute("linkTarget", linkTarget, range);
      });
    };

    this.editor.model.document.registerPostFixer((writer) => {
      const changes = this.editor.model.document.differ.getChanges();

      for (const entry of changes) {
        const linkTarget = this.#computeLinkTarget(entry);
        if (!linkTarget) {
          continue;
        }
        const range = this.#getLinkRange(entry, writer);
        addLinkTarget(linkTarget, range);
      }
      return false;
    });

    reportInitEnd(initInformation);
  }

  /**
   * Type-guard for DiffItemAttribute type
   * @param diffItem - the variable to check
   */
  #isDiffItemAttribute(diffItem: DiffItem): diffItem is DiffItemAttribute {
    return diffItem.type === "attribute" && diffItem.attributeKey === "linkHref";
  }

  /**
   * Type-guard for DiffItemInsert type
   * @param diffItem - the variable to check
   */
  #isDiffItemInsert(diffItem: DiffItem): diffItem is DiffItemInsert {
    return diffItem.type === "insert" && diffItem.attributes.has("linkHref");
  }

  /**
   * Computes the range for any inserted or edited link elements.
   * @param diffItem - the diffItem to be checked
   * @param writer - the writer, needed to create a range for inserted links
   * @returns the range or undefined
   * @private
   */
  #getLinkRange(diffItem: DiffItem, writer: Writer): Range {
    if (this.#isDiffItemAttribute(diffItem)) {
      return diffItem.range;
    }
    const { position: start } = diffItem;
    const end = start.getShiftedBy(diffItem.length);
    return writer.createRange(start, end);
  }

  /**
   * Computes a default link target for any inserted or edited link elements.
   * @param diffItem - the diffItem to be checked
   * @returns the link target or undefined
   * @private
   */
  #computeLinkTarget(diffItem: DiffItem): string | undefined {
    if (this.#isDiffItemAttribute(diffItem)) {
      // The linkHref attribute was added/changed for this node
      // This might happen if an existing link gets edited e.g. if the link url gets changed.
      return computeDefaultLinkTargetForUrl(diffItem.attributeNewValue as string, this.editor.config);
    }

    if (this.#isDiffItemInsert(diffItem)) {
      // An entry with linkHref attribute was inserted
      // This applies to links, created via the link balloon and contents dropped into the
      // editor or into the link balloon
      return computeDefaultLinkTargetForUrl(diffItem.attributes.get("linkHref") as string, this.editor.config);
    }

    return undefined;
  }
}
