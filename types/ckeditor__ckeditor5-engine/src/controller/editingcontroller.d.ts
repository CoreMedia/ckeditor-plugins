import View from "../view/view"
import Emitter, { CallbackFunction, EmitterMixinDelegateChain } from "@ckeditor/ckeditor5-utils/src/emittermixin"
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin"
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities"
import Model from "../model/model";
import DowncastDispatcher from "../conversion/downcastdispatcher";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import Mapper from "../conversion/mapper";
import { Item } from "../model/item";

// TODO[typing]
type StylesProcessor = any;

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_controller_editingcontroller-EditingController.html">Class EditingController (engine/controller/editingcontroller~EditingController) - CKEditor 5 API docs</a>
 */
export default class EditingController implements Emitter, Observable {
  readonly downcastDispatcher: DowncastDispatcher;
  readonly mapper: Mapper;
  readonly model: Model;
  readonly view: View;

  constructor(model: Model, stylesProcessor: StylesProcessor);

  delegate(...events: string[]): EmitterMixinDelegateChain;

  decorate(methodName: string): void;

  destroy(): void;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;

  reconvertItem(item: Item): void;

  listenTo(emitter: Emitter, event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;
}
