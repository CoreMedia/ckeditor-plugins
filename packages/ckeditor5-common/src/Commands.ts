import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { forceDisable } from "./Events";

/**
 * Disables a command with the given command name
 *
 * @param editor - the editor
 * @param commandName - the command name
 */
export const disableCommand = (editor: Editor, commandName: string): void => {
  const command = editor.commands.get(commandName);
  if (!command) {
    return;
  }
  command.on("set:isEnabled", forceDisable, { priority: "highest" });
  command.isEnabled = false;
};

/**
 * Enables a command with the given command name
 *
 * @param editor - the editor
 * @param commandName - the command name
 */
export const enableCommand = (editor: Editor, commandName: string): void => {
  const command = editor.commands.get(commandName);
  if (!command) {
    return;
  }
  command.off("set:isEnabled", forceDisable);
  command.refresh();
};
