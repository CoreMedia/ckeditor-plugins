import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

export default class CommandUtils {
  static disableCommand(editor: Editor, commandName: string): void {
    const command = editor.commands.get(commandName);
    if (!command) {
      return;
    }
    command.on("set:isEnabled", this.forceDisable, { priority: "highest" });
    command.isEnabled = false;
  }

  static enableCommand(editor: Editor, commandName: string): void {
    const command = editor.commands.get(commandName);
    if (!command) {
      return;
    }
    command.off("set:isEnabled", this.forceDisable);
    command.refresh();
  }

  static forceDisable(evt: EventInfo) {
    evt.return = false;
    evt.stop();
  }
}
