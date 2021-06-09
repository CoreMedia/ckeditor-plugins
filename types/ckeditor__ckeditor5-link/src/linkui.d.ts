import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkFormView from "./ui/linkformview";
import Observable from "@ckeditor/ckeditor5-utils/src/observablemixin";
import Emitter, { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "@ckeditor/ckeditor5-engine/src/view/observer/domeventdata";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_link_linkui-LinkUI.html">Class LinkUI (link/linkui~LinkUI) - CKEditor 5 API docs</a>
 */
export default class LinkUI extends Plugin implements Emitter, Observable {
  static readonly pluginName: "LinkUI";

  readonly editor: Editor;
  formView: LinkFormView;
  readonly isEnabled: boolean;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  stopListening(emitter?: Emitter, event?: string, callback?: (info: EventInfo, data: DomEventData) => void): void;
}
