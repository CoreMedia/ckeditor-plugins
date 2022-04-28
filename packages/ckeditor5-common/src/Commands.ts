import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { forceDisable } from "./Events";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Command from "@ckeditor/ckeditor5-core/src/command";

const logger: Logger = LoggerProvider.getLogger("Commands");

/**
 * Suggested alternative `catch` handler, if a command is not found.
 * It will trigger a debug log statement.
 *
 * @param e - error to ignore
 */
export const optionalCommandNotFound = (e: Error) => logger.debug("Optional command not found.", e);

/**
 * Suggested alternative `catch` handler, if a command is not found.
 * It will trigger a warning log statement.
 *
 * @param e - error to ignore
 */
export const recommendedCommandNotFound = (e: Error) => logger.warn("Recommended command not found.", e);

/**
 * Immediately resolving promise to retrieve command. Rejected with `Error`
 * when command is not found.
 *
 * @param editor - editor instance
 * @param commandName - command name to search for
 */
export const ifCommand = async (editor: Editor, commandName: string): Promise<Command> => {
  const command = editor.commands.get(commandName);
  if (!command) {
    throw new Error(`Command '${commandName}' unavailable.`);
  }
  return command;
};

/**
 * Disables the given command.
 * @param command - command to disable
 */
export const disableCommand = (command: Command): void => {
  command.on("set:isEnabled", forceDisable, { priority: "highest" });
  command.isEnabled = false;
};

/**
 * Enables the given command.
 * @param command - command to disable
 */
export const enableCommand = (command: Command): void => {
  command.off("set:isEnabled", forceDisable);
  command.refresh();
};
