import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { requireEditorWithUI } from "@coremedia/ckeditor5-core-common/Editors";
import openInTabIcon from "../../theme/icons/openInTab.svg";
import "../lang/contentImageOpenInTab";

import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import ContentImageEditingPlugin from "../ContentImageEditingPlugin";

export default class ContentImageOpenInTabUI extends Plugin {
  static readonly pluginName: string = "ContentImageOpenInTabUI";

  static readonly requires = [ContentImageEditingPlugin];

  async init(): Promise<void> {
    const editor = this.editor;

    const initInformation = reportInitStart(this);
    this.#createToolbarLinkImageButton(editor as EditorWithUI);
    reportInitEnd(initInformation);
  }

  #createToolbarLinkImageButton(editor: EditorWithUI): void {
    const { ui } = requireEditorWithUI(this.editor);
    const t = editor.t;

    const openInTabCommand = editor.commands.get("openImageInTab");
    if (!openInTabCommand) {
      throw new Error('The command "openImageInTab" is required.');
    }

    ui.componentFactory.add("contentImageOpenInTab", (locale) => {
      const button = new ButtonView(locale);

      button.set({
        isEnabled: true,
        label: t("Open in tab"),
        icon: openInTabIcon,
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
