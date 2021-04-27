import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import TwoStepCaretMovement from "@ckeditor/ckeditor5-typing/src/twostepcaretmovement";
import Input from "@ckeditor/ckeditor5-typing/src/input";
import ClipboardPipeline from "@ckeditor/ckeditor5-clipboard/src/clipboardpipeline";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_link_linkediting-LinkEditing.html">Class LinkEditing (link/linkediting~LinkEditing) - CKEditor 5 API docs</a>
 */
// @ts-ignore: Fails for `requires`. TODO[cke]
export default class LinkEditing extends Plugin {
  static readonly pluginName: "LinkEditing";

  static readonly requires: [
    TwoStepCaretMovement,
    Input,
    ClipboardPipeline
  ];
}
