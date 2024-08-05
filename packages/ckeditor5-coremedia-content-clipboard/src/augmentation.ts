// noinspection JSUnusedGlobalSymbols

import type {
  ContentClipboard,
  ContentClipboardEditing,
  PasteContentCommand,
  PasteContentEditing,
  PasteContentPlugin,
  PasteContentUI,
  UndoSupport,
} from "./index";
declare module "ckeditor5" {
  interface PluginsMap {
    [ContentClipboard.pluginName]: ContentClipboard;
    [ContentClipboardEditing.pluginName]: ContentClipboardEditing;
    [PasteContentEditing.pluginName]: ContentClipboardEditing;
    [PasteContentPlugin.pluginName]: ContentClipboardEditing;
    [PasteContentUI.pluginName]: ContentClipboardEditing;
    [UndoSupport.pluginName]: UndoSupport;
  }
  interface CommandsMap {
    [PasteContentEditing.pasteContentCommand]: PasteContentCommand;
  }
}
