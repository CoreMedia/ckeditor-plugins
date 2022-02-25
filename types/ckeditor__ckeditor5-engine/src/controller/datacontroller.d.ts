import ViewDocument from "../view/document"
import Emitter, { CallbackFunction, EmitterMixinDelegateChain } from "@ckeditor/ckeditor5-utils/src/emittermixin"
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin"
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities"
import DataProcessor from "../dataprocessor/dataprocessor";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import Element from "../view/element";
import Mapper from "../conversion/mapper";
import { SchemaContextDefinition } from "../model/schema";
import UpcastDispatcher from "../conversion/upcastdispatcher";

/**
 * Controller for the data pipeline.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_controller_datacontroller-DataController.html">Class DataController (engine/controller/datacontroller~DataController) - CKEditor 5 API docs</a>
 */
export default class DataController implements Emitter, Observable {
  delegate(...events: string[]): EmitterMixinDelegateChain;

  processor: DataProcessor;
  upcastDispatcher: UpcastDispatcher;
  readonly viewDocument: ViewDocument;
  mapper: Mapper;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;

  listenTo(emitter: Emitter, event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  decorate(methodName: string): void;

  toModel(viewElementOdFramgment: Element | DocumentFragment, context?: SchemaContextDefinition): DocumentFragment;
}
