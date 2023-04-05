import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { requireEditorWithUI } from "@coremedia/ckeditor5-core-common/Editors";
import openInTabIcon from "../../theme/icons/openInTab.svg";
import "../lang/contentImageOpenInTab";

import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import ContentImageEditingPlugin from "../ContentImageEditingPlugin";
import { executeOpenImageInTabCommand, requireOpenImageInTabCommand } from "./OpenImageInTabCommand";

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
    const editor = this.editor;

    const initInformation = reportInitStart(this);
    this.#createToolbarLinkImageButton(editor as EditorWithUI);
    reportInitEnd(initInformation);
  }

  #createToolbarLinkImageButton(editor: EditorWithUI): void {
    const { ui } = requireEditorWithUI(this.editor);
    const t = editor.t;

    const OPEN_IN_TAB_KEYSTROKE = "Ctrl+Shift+O";

    editor.keystrokes.set(OPEN_IN_TAB_KEYSTROKE, (keyEvtData, cancel) => {
      // Prevent focusing the search bar in FF, Chrome and Edge. See https://github.com/ckeditor/ckeditor5/issues/4811.
      cancel();

      executeOpenImageInTabCommand(editor);
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

      button.bind("isEnabled").to(requireOpenImageInTabCommand(editor), "isEnabled");

      this.listenTo(button, "execute", () => {
        executeOpenImageInTabCommand(editor);
      });
      return button;
    });
  }
}
