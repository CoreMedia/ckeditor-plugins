import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin";
import Observable from "@ckeditor/ckeditor5-utils/src/observablemixin";
import {PriorityString} from "@ckeditor/ckeditor5-utils/src/priorities";

export default class Model implements Emitter, Observable {
  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;
}
