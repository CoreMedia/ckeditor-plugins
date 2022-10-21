import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import pasteIcon from "../../theme/icons/paste.svg";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";

export default class PasteContentUI extends Plugin {
  init() {
    const initInformation = reportInitStart(this);
    const editor = this.editor as EditorWithUI;
    const pasteContentCommand = editor.commands.get("pasteContentCommand");
    if (!pasteContentCommand) {
      throw new Error('The command "pasteContent" is required.');
    }

    editor.ui.componentFactory.add("pasteContent", () => {
      const button = new ButtonView();
      button.icon = pasteIcon;
      button.bind("isEnabled").to(pasteContentCommand, "isEnabled");

      this.listenTo(button, "execute", () => {
        pasteContentCommand.execute();
      });

      return button;
    });
    reportInitEnd(initInformation);
  }
}
