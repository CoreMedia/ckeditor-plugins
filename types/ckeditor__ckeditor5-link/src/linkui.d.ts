import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkFormView from "./ui/linkformview";
import Observable from "@ckeditor/ckeditor5-utils/src/observablemixin";
import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_link_linkui-LinkUI.html">Class LinkUI (link/linkui~LinkUI) - CKEditor 5 API docs</a>
 */
export default class LinkUI extends Plugin implements Emitter, Observable {
  static readonly pluginName: "LinkUI";

  readonly editor: Editor;
  formView: LinkFormView;
  readonly isEnabled: boolean;

  once(event: string, callback: Function, options?: { priority: PriorityString | number }): void;
}
