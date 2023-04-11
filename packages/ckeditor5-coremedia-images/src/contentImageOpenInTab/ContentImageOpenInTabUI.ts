import { ButtonView } from "@ckeditor/ckeditor5-ui";
import { Plugin, Editor } from "@ckeditor/ckeditor5-core";
import openInTabIcon from "../../theme/icons/openInTab.svg";
import "../lang/contentImageOpenInTab";

import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import ContentImageEditingPlugin from "../ContentImageEditingPlugin";

/**
 * Plugin that registers a 'contentImageOpenInTab' button in
 * the editor's componentFactory to be used in editor toolbars.
 *
 * This button uses the 'openInTabCommand', registered in the
 * ContentImageEditingPlugin, which therefore is required.
 */
export default class ContentImageOpenInTabUI extends Plugin {
  static readonly pluginName: string = "ContentImageOpenInTabUI";

  static readonly requires = [ContentImageEditingPlugin];

  init(): void {
    const initInformation = reportInitStart(this);
    this.#createToolbarLinkImageButton(this.editor);
    reportInitEnd(initInformation);
  }

  #createToolbarLinkImageButton(editor: Editor): void {
    const { ui } = editor;
    const t = editor.t;

    const openInTabCommand = editor.commands.get("openImageInTab");
    if (!openInTabCommand) {
      throw new Error('The command "openImageInTab" is required.');
    }

    const OPEN_IN_TAB_KEYSTROKE = "Ctrl+Shift+O";

    editor.keystrokes.set(OPEN_IN_TAB_KEYSTROKE, (keyEvtData, cancel) => {
      // Prevent focusing the search bar in FF, Chrome and Edge. See https://github.com/ckeditor/ckeditor5/issues/4811.
      cancel();

      if (openInTabCommand.isEnabled) {
        openInTabCommand.execute();
      }
    });
    ui.componentFactory.add("contentImageOpenInTab", (locale) => {
      const button = new ButtonView(locale);

      button.set({
        isEnabled: true,
        label: t("Open in tab"),
        icon: openInTabIcon,
        keystroke: OPEN_IN_TAB_KEYSTROKE,
        tooltip: true,
      });

      button.bind("isEnabled").to(openInTabCommand, "isEnabled");

      this.listenTo(button, "execute", () => {
        openInTabCommand.execute();
      });
      return button;
    });
  }
}
