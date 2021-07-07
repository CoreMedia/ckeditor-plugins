import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import LinkTargetModelView from "./LinkTargetModelView";
import LinkTargetUI from "./LinkTargetUI";
import Link from "@ckeditor/ckeditor5-link/src/link";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import ContentLinks from "./ContentLinks";

/**
 * Adds an attribute `linkTarget` to the model, which will be represented
 * as `target` attribute in view.
 *
 * Also adds the ContentLinks plugin, which allows content objects to be dropped into the link dialog.
 *
 * @see <a href="https://stackoverflow.com/questions/51303892/how-to-add-target-attribute-to-a-tag-in-ckeditor5">How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow</a>
 */
export default class LinkTarget extends Plugin {
  static readonly pluginName: string = "LinkTarget";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [Link, LinkTargetModelView, LinkTargetUI, ContentLinks];
  }
}
