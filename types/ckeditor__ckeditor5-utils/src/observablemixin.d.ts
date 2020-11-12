import Emitter from "./emittermixin";
import {PriorityString} from "./priorities";

export default interface Observable extends Emitter {
  on(event: string, callback: Function, options?: {priority: PriorityString | number}): void;
}
