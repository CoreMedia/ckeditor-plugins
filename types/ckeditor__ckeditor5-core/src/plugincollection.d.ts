import Plugin, { PluginInterface } from "./plugin";
import Editor from "./editor/editor";
import Emitter, {EmitterMixinDelegateChain} from "@ckeditor/ckeditor5-utils/src/emittermixin";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "@ckeditor/ckeditor5-engine/src/view/observer/domeventdata";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";

// tslint:disable-next-line:no-empty-interface
export interface Plugins {
}

export default class PluginCollection implements Emitter, Iterable<[typeof Plugin, Plugin]> {
  constructor(
    context: Editor,
    availablePlugins?: Array<typeof Plugin>,
    contextPlugins?: Iterable<[typeof Plugin, Plugin]>,
  );

  [Symbol.iterator](): Iterator<[typeof Plugin, Plugin]>;

  destroy(): Promise<void>;

  get<T extends Plugin>(key: PluginInterface<T>): T | undefined;
  get<T extends keyof Plugins>(key: T): Plugins[T];
  get(key: string): Plugin | undefined;

  has(key: PluginInterface | string): boolean;

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

  off(event: string, callback?: (info: EventInfo, data: DomEventData) => void): void;

  listenTo(
    emitter: Emitter,
    event: string,
    callback: (info: EventInfo, data: DomEventData) => void,
    options?: { priority?: PriorityString | number | undefined },
  ): void;

  stopListening(emitter?: Emitter, event?: string, callback?: (info: EventInfo, data: DomEventData) => void): void;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopDelegating(event?: string, emitter?: Emitter): void;

  delegate(...events: string[]): EmitterMixinDelegateChain;
}
