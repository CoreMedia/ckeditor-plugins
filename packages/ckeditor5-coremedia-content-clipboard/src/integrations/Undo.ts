import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import UndoEditing from "@ckeditor/ckeditor5-undo/src/undoediting";
import {
  CommandHandler,
  disableCommand,
  enableCommand,
  ifCommand,
  optionalCommandNotFound,
} from "@coremedia/ckeditor5-common/Commands";

const PLUGIN_NAME = "CoreMediaContentClipboardUndoSupport";

/**
 * Hooks into `Undo` plugin, if available to possibly disable or enable
 * corresponding commands.
 */
export class UndoSupport extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;
  static readonly #logger: Logger = LoggerProvider.getLogger(PLUGIN_NAME);
  static readonly #disableHandler = disableCommand(PLUGIN_NAME);
  static readonly #enableHandler = enableCommand(PLUGIN_NAME);
  static readonly #commandNames = ["undo", "redo"];

  /**
   * Flag to signal, if supported plugin is available or not.
   */
  #enabled = false;

  init(): void {
    const logger = UndoSupport.#logger;
    const { pluginName } = UndoSupport;
    const { editor } = this;

    const startTimestamp = performance.now();

    logger.debug(`Initializing ${pluginName}...`);

    this.#enabled = editor.plugins.has(UndoEditing);

    logger.debug(`Initialized ${pluginName} within ${performance.now() - startTimestamp} ms.`);
  }

  /**
   * Disables commands from Undo-Plugin, if existing.
   */
  disableUndo() {
    if (!this.#enabled) {
      return;
    }
    this.#applyToCommands(UndoSupport.#disableHandler);
  }

  /**
   * Enables commands from Undo-Plugin, if existing.
   */
  enableUndo() {
    if (!this.#enabled) {
      return;
    }
    this.#applyToCommands(UndoSupport.#enableHandler);
  }

  #applyToCommands(handler: CommandHandler): void {
    const { editor } = this;
    const commandNames = UndoSupport.#commandNames;
    commandNames.forEach((commandName) => {
      ifCommand(editor, commandName).then(handler).catch(optionalCommandNotFound);
    });
  }
}

/**
 * Convenience handler to invoke `disableUndo` on plugin.
 * @param plugin - plugin to invoke method on
 */
export const disableUndo = (plugin: UndoSupport): void => {
  plugin.disableUndo();
};

/**
 * Convenience handler to invoke `disableUndo` on plugin.
 * @param plugin - plugin to invoke method on
 */
export const enableUndo = (plugin: UndoSupport): void => {
  plugin.enableUndo();
};