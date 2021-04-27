/**
 * Collection of commands.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_core_commandcollection-CommandCollection.html">Class CommandCollection (core/commandcollection~CommandCollection) - CKEditor 5 API docs</a>
 */
import Command from "./command";

export default class CommandCollection {
  constructor();
  [Symbol.iterator](): IterableIterator<[string, Command]>;
  add(commandName: string, command: Command): void;
  get(commandName: string): Command;
  execute(commandName: string, ...args: any[]): any;
  // TODO[cke] Unsure about types TReturn and TNext
  names(): Generator<string, void, any>;
  // TODO[cke] Unsure about types TReturn and TNext
  commands(): Generator<Command, void, any>;
  destroy(): void;
}
