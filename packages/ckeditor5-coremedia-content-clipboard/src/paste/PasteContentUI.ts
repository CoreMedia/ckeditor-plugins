import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import pasteIcon from "../../theme/icons/paste.svg";
import "../lang/paste";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";

export default class PasteContentUI extends Plugin {
  init() {
    const initInformation = reportInitStart(this);
    const editor = this.editor as EditorWithUI;
    const t = editor.t;
    const pasteContentCommand = editor.commands.get("pasteContentCommand");
    if (!pasteContentCommand) {
      throw new Error('The command "pasteContent" is required.');
    }

    const PASTE_KEYSTROKE = "Ctrl+Shift+L";

    editor.keystrokes.set(PASTE_KEYSTROKE, (keyEvtData, cancel) => {
      // Prevent focusing the search bar in FF, Chrome and Edge. See https://github.com/ckeditor/ckeditor5/issues/4811.
      cancel();

      if (pasteContentCommand.isEnabled) {
        pasteContentCommand.execute();
      }
    });

    editor.ui.componentFactory.add("pasteContent", () => {
      const button = new ButtonView();
      button.label = t("Paste Content");
      button.icon = pasteIcon;
      button.tooltip = true;
      button.keystroke = PASTE_KEYSTROKE;
      button.bind("isEnabled").to(pasteContentCommand, "isEnabled");

      this.listenTo(button, "execute", () => {
        pasteContentCommand.execute();
      });

      return button;
    });
    reportInitEnd(initInformation);
  }
}
