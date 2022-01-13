import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import LinkTargetModelView from "./LinkTargetModelView";
import Link from "@ckeditor/ckeditor5-link/src/link";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkTargetActionsViewExtension from "./LinkTargetActionsViewExtension";
import "../lang/linktarget";
/**
 * Adds an attribute `linkTarget` to the model, which will be represented
 * as `target` attribute in view.
 *
 * @see {@link https://stackoverflow.com/questions/51303892/how-to-add-target-attribute-to-a-tag-in-ckeditor5 | How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow}
 */
export default class LinkTarget extends Plugin {
  static readonly pluginName: string = "LinkTarget";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [Link, LinkTargetModelView, LinkTargetActionsViewExtension];
  }
}
