import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

/**
 * Command utilities to manipulate commands.
 * Commands need to be identified via their unique command name.
 */
export default class CommandUtils {
  /**
   * Disables a command with the given command name
   *
   * @param editor - the editor
   * @param commandName - the command name
   */
  static disableCommand(editor: Editor, commandName: string): void {
    const command = editor.commands.get(commandName);
    if (!command) {
      return;
    }
    command.on("set:isEnabled", this.#forceDisable, { priority: "highest" });
    command.isEnabled = false;
  }

  /**
   * Enables a command with the given command name
   *
   * @param editor - the editor
   * @param commandName - the command name
   */
  static enableCommand(editor: Editor, commandName: string): void {
    const command = editor.commands.get(commandName);
    if (!command) {
      return;
    }
    command.off("set:isEnabled", this.#forceDisable);
    command.refresh();
  }

  /**
   * Disables the event by making sure no other listeners are executed
   * and setting the return value to false
   *
   * @param evt - eventinfo
   * @private
   */
  static #forceDisable(evt: EventInfo) {
    evt.return = false;
    evt.stop();
  }
}
