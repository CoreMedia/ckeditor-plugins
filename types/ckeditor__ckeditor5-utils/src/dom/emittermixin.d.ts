import BaseEmitter, { EmitterMixinDelegateChain } from "../emittermixin";
import EventInfo from "../eventinfo";
import { PriorityString } from "../priorities";

// TODO we cannot import DomEventData from ckeditor5-engine because it would result in a cyclic dependency
type DomEventData = any;

export interface Emitter extends BaseEmitter {
  delegate(...events: string[]): EmitterMixinDelegateChain;
  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;
  listenTo(
    emitter: Emitter,
    event: string,
    callback: (info: EventInfo, data: DomEventData) => void,
    options?: { priority?: PriorityString | number | undefined },
  ): void;
  off(event: string, callback?: (info: EventInfo, data: DomEventData) => void): void;
  on: (
    event: string,
    callback: (info: EventInfo, data: DomEventData) => void,
    options?: { priority: PriorityString | number },
  ) => void;
  once(
    event: string,
    callback: (info: EventInfo, data: DomEventData) => void,
    options?: { priority: PriorityString | number },
  ): void;
  stopDelegating(event?: string, emitter?: Emitter): void;
  stopListening(emitter?: Emitter, event?: string, callback?: (info: EventInfo, data: DomEventData) => void): void;
}

declare const DomEmitterMixin: Emitter;

export default DomEmitterMixin;
