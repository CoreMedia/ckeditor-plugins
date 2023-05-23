import Command from "@ckeditor/ckeditor5-core/src/command";

export const BLOCKLIST_COMMAND_NAME = "Blocklist";

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
