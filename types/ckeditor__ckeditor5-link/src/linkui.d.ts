import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkFormView from "./ui/linkformview";
import { Observable } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import { CallbackFunction, Emitter } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import LinkActionsView from "./ui/linkactionsview";
import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";
import { Options } from "@ckeditor/ckeditor5-utils/src/dom/position";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_link_linkui-LinkUI.html">Class LinkUI (link/linkui~LinkUI) - CKEditor 5 API docs</a>
 */
export default class LinkUI extends Plugin implements Emitter, Observable {
  static readonly pluginName: "LinkUI";

  readonly editor: Editor & EditorWithUI;
  actionsView: LinkActionsView;
  formView: LinkFormView;
  readonly isEnabled: boolean;
  _balloon: any;

  get _isUIInPanel(): boolean;

  // Private API, but required, as we otherwise would have to duplicate position calculation.
  _getBalloonPositionData(): Options;

  _hideUI(): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;

  listenTo(emitter: Emitter, event: string, callback: (info: EventInfo, data: any) => void, options?: { priority: PriorityString | number }): void;
}
