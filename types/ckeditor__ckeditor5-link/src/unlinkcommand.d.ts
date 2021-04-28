import Command from "@ckeditor/ckeditor5-core/src/command";

/**
 * The unlink command.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_link_unlinkcommand-UnlinkCommand.html">Class UnlinkCommand (link/unlinkcommand~UnlinkCommand) - CKEditor 5 API docs</a>
 */
export default class UnlinkCommand extends Command {
  refresh(): void;

  execute(): void;
}
