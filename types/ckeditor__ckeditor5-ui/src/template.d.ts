import View from "./view";
import { CallbackFunction, Emitter, EmitterMixinDelegateChain } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "@ckeditor/ckeditor5-engine/src/view/observer/domeventdata";
import TemplateIfBinding from "./template/templateifbinding";

/**
 * A basic Template class.
 */
export default class Template implements Emitter {
  constructor(def: any);

  attributes: {class: Array<string | TemplateIfBinding>};

  render(): HTMLElement|Text;
  apply(node: Node): any;
  revert(node: Node): void;
  getViews(): Generator<View, void, any>;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;

  listenTo(emitter: Emitter, event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  delegate(...events: string[]): EmitterMixinDelegateChain;
}
