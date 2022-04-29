import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Command from "@ckeditor/ckeditor5-core/src/command";
import { PluginNotFoundErrorHandler } from "./Plugins";

const commandsLogger: Logger = LoggerProvider.getLogger("Commands");

/**
 * Error, which signals that a requested command could not be found.
 */
export class CommandNotFoundError extends Error {
  readonly #name: string;

  /**
   * Constructor.
   *
   * @param commandName - name of the command, which could not be found
   * @param message - error message
   */
  constructor(commandName: string, message: string) {
    super(message);
    Object.setPrototypeOf(this, CommandNotFoundError.prototype);
    this.#name = commandName;
  }

  /**
   * Provides the name of the command, which was searched
   * for unsuccessfully.
   */
  get commandName(): string {
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
  commandsLogger.debug(`Optional command '${e.commandName}' not found.`, e);

/**
 * Provides a `catch` handler, if a recommended command is not found.
 * It will trigger a warning log statement and a debug log statement with more details.
 * @param effectIfMissingMessage - optional effect, what will happen if the plugin is missing
 * @param logger - optional logger to use instead of default
 */
export const recommendCommand = (
  effectIfMissingMessage = "",
  logger: Logger = commandsLogger
): CommandNotFoundErrorHandler => {
  const messageSuffix = effectIfMissingMessage ? ` ${effectIfMissingMessage}` : "";
  return (e) => {
    const message = `Recommended command '${e.commandName}' not found.${messageSuffix}`;
    logger.warn(message);
    logger.debug(`Details on: ${message}`, e);
  };
};

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
