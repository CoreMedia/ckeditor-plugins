import type ContentClipboard from "./ContentClipboard";
import type ContentClipboardEditing from "./ContentClipboardEditing";
import type { UndoSupport } from "./integrations/Undo";
import type { PasteContentCommand } from "./paste/PasteContentCommand";
import type PasteContentEditing from "./paste/PasteContentEditing";
import type PasteContentPlugin from "./paste/PasteContentPlugin";
import type PasteContentUI from "./paste/PasteContentUI";

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
