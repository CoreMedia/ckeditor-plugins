import { Plugin } from "@ckeditor/ckeditor5-core";
import BlocklistCommand, { BLOCKLIST_COMMAND_NAME } from "./blocklistCommand";

export default class BlocklistEditing extends Plugin {
  static readonly pluginName: string = "BlocklistEditing";

  init(): void {
    const editor = this.editor;
    editor.commands.add(BLOCKLIST_COMMAND_NAME, new BlocklistCommand(editor));
  }
}
