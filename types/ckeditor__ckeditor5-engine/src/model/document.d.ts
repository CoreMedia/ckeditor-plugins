import Emitter, { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import Model from "./model";
import Writer from "./writer";
import Differ from "./differ";
import RootElement from "./rootelement";
import History from "./history";
import Collection from "@ckeditor/ckeditor5-utils/src/collection";
import DocumentSelection from "./documentselection";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "../view/observer/domeventdata";

/**
 * Data model's document. It contains the model's structure, its selection and the history of changes.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_document-Document.html">Class Document (engine/model/document~Document) - CKEditor 5 API docs</a>
 */
export default class Document implements Emitter {
  constructor();

  get differ(): Differ;

  get graveyard(): RootElement;

  get history(): History;

  get model(): Model;

  get roots(): Collection<RootElement>;

  get selection(): DocumentSelection;

  get version(): number;

  createRoot(elementName?: string, rootName?: string): any;

  destroy(): void;

  getRoot(name?: string): any | null;

  getRootNames(): string[];

  registerPostFixer(postFixer: (writer: Writer) => void | boolean): void;

  toJSON(): Object;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: (info: EventInfo, data: DomEventData) => void): void;
}
