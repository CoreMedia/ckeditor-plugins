import Command from "@ckeditor/ckeditor5-core/src/command";

export const BLOCKLIST_COMMAND_NAME = "Blocklist";

/**
 * Command, used to keep track of the currently selected words in the editor.
 * When the blocklist balloon opens, it displays as list of words, based on
 * the value of this command.
 */
export default class BlocklistCommand extends Command {
  /**
   * The words in the block list, that are active for the current selection / cursor position.
   *
   * @readonly
   */
  public declare value: string[];

  override execute() {
    this.refresh();
  }
}
