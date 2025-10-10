import ContentClipboard from "./ContentClipboard";
import ContentClipboardEditing from "./ContentClipboardEditing";
import { UndoSupport } from "./integrations/Undo";
import { PasteContentCommand } from "./paste/PasteContentCommand";
import PasteContentEditing from "./paste/PasteContentEditing";
import PasteContentPlugin from "./paste/PasteContentPlugin";
import PasteContentUI from "./paste/PasteContentUI";

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
