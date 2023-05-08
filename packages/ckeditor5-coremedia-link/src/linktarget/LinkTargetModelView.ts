/* eslint no-null/no-null: off */

import { Plugin } from "@ckeditor/ckeditor5-core";
import { LINK_TARGET_MODEL, LINK_TARGET_VIEW } from "./Constants";
import LinkTargetCommand from "./command/LinkTargetCommand";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";
import { getLinkAttributes, LinkAttributes } from "@coremedia/ckeditor5-link-common/src/LinkAttributes";

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
   */
  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);

    const { editor } = this;

    getLinkAttributes(editor)?.registerAttribute({
      model: LINK_TARGET_MODEL,
      view: LINK_TARGET_VIEW,
    });

    editor.commands.add("linkTarget", new LinkTargetCommand(editor));

    reportInitEnd(initInformation);
  }
}
