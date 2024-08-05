import { Plugin, Editor, ButtonView } from "ckeditor5";
import pasteIcon from "../../theme/icons/paste.svg";
import "../lang/paste";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";
export default class PasteContentUI extends Plugin {
  static readonly pluginName = "pasteContentUI";
  init() {
    const initInformation = reportInitStart(this);
    const editor: Editor = this.editor;
    const t = editor.t;
    const pasteContentCommand = editor.commands.get("pasteContentCommand");
    if (!pasteContentCommand) {
      throw new Error('The command "pasteContent" is required.');
    }
    const PASTE_KEYSTROKE = "Ctrl+Shift+P";
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
      button.class = "paste-content-button";
      button.bind("isEnabled").to(pasteContentCommand, "isEnabled");
      this.listenTo(button, "execute", () => {
        pasteContentCommand.execute();
      });
      return button;
    });
    reportInitEnd(initInformation);
  }
}
