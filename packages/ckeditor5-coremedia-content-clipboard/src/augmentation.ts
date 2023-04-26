// noinspection JSUnusedGlobalSymbols

import type { ContentClipboard, ContentClipboardEditing, UndoSupport } from "./index";

declare module "@ckeditor/ckeditor5-core" {
  interface PluginsMap {
    [ContentClipboard.pluginName]: ContentClipboard;
    [ContentClipboardEditing.pluginName]: ContentClipboardEditing;
    [UndoSupport.pluginName]: UndoSupport;
  }
}
