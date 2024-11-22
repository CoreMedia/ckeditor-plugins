import LinkTargetModelView from "./LinkTargetModelView";
import { Plugin, Link } from "ckeditor5";
import LinkTargetActionsViewExtension from "./LinkTargetActionsViewExtension";
import "../lang/linktarget";
/**
 * Adds an attribute `linkTarget` to the model, which will be represented
 * as `target` attribute in view.
 *
 * @see {@link https://stackoverflow.com/questions/51303892/how-to-add-target-attribute-to-a-tag-in-ckeditor5 | How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow}
 */
export default class LinkTarget extends Plugin {
  public static readonly pluginName = "LinkTarget" as const;
  static readonly requires = [Link, LinkTargetModelView, LinkTargetActionsViewExtension];
}
