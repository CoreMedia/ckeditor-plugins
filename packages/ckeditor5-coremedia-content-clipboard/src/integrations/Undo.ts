import { Plugin, UndoEditing } from "ckeditor5";
import type { CommandHandler } from "@coremedia/ckeditor5-core-common";
import {
  disableCommand,
  enableCommand,
  ifCommand,
  optionalCommandNotFound,
  reportInitEnd,
  reportInitStart,
} from "@coremedia/ckeditor5-core-common";

const PLUGIN_NAME = "CoreMediaContentClipboardUndoSupport";

/**
 * Hooks into `Undo` plugin, if available to possibly disable or enable
 * corresponding commands.
 */
export class UndoSupport extends Plugin {
  static readonly pluginName = PLUGIN_NAME;
  static readonly #disableHandler = disableCommand(PLUGIN_NAME);
  static readonly #enableHandler = enableCommand(PLUGIN_NAME);
  static readonly #commandNames = ["undo", "redo"];

  /**
   * Flag to signal, if supported plugin is available or not.
   */
  #enabled = false;

  init(): void {
    const { editor } = this;
    const initInformation = reportInitStart(this);
    this.#enabled = editor.plugins.has(UndoEditing);
    reportInitEnd(initInformation);
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
    commandNames.forEach((commandName: string) => {
      ifCommand(editor, commandName).then(handler).catch(optionalCommandNotFound);
    });
  }
}

/**
 * Convenience handler to invoke `disableUndo` on plugin.
 *
 * @param plugin - plugin to invoke method on
 */
export const disableUndo = (plugin: UndoSupport): void => {
  plugin.disableUndo();
};

/**
 * Convenience handler to invoke `disableUndo` on plugin.
 *
 * @param plugin - plugin to invoke method on
 */
export const enableUndo = (plugin: UndoSupport): void => {
  plugin.enableUndo();
};
