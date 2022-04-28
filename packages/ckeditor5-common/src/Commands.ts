import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Command from "@ckeditor/ckeditor5-core/src/command";

const logger: Logger = LoggerProvider.getLogger("Commands");

/**
 * Error, which signals that a requested command could not be found.
 */
export class CommandNotFoundError extends Error {
  readonly #name: string;

  constructor(commandName: string, message: string) {
    super(message);
    Object.setPrototypeOf(this, CommandNotFoundError.prototype);
    this.#name = commandName;
  }

  get name(): string {
    return this.#name;
  }
}

/**
 * Error handler, if command could not be found.
 */
export type CommandNotFoundErrorHandler = (e: CommandNotFoundError) => void;

/**
 * Suggested alternative `catch` handler, if a command is not found.
 * It will trigger a debug log statement.
 *
 * @param e - error to ignore
 */
export const optionalCommandNotFound: CommandNotFoundErrorHandler = (e: CommandNotFoundError) =>
  logger.debug(`Optional command '${e.name}' not found.`, e);

/**
 * Immediately resolving promise to retrieve command. Rejected with `Error`
 * when command is not found.
 *
 * @param editor - editor instance
 * @param commandName - command name to search for
 * @throws CommandNotFoundError if command could not be found
 */
export const ifCommand = async (editor: Editor, commandName: string): Promise<Command> => {
  const command = editor.commands.get(commandName);
  if (!command) {
    throw new CommandNotFoundError(commandName, `Command '${commandName}' unavailable.`);
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
