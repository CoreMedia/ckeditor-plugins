import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
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
 * Handler for resolved plugins.
 */
export type CommandHandler = (command: Command) => void;

/**
 * Handler to disable given command.
 *
 * @param id - Unique identifier for disabling. Use the same id when enabling back the command.
 * @returns identifiable handler to disable a command
 */
export const disableCommand = (id: string): CommandHandler => {
  return (command) => command.forceDisabled(id);
};

/**
 * Handler to enable given commands.
 *
 * @param id - Unique identifier for enabling. Use the same id as when requested to disable command.
 * @returns identifiable handler to enable a command
 */
export const enableCommand = (id: string): CommandHandler => {
  return (command) => command.clearForceDisabled(id);
};
