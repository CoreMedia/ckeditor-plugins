import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { requireEditorWithUI } from "@coremedia/ckeditor5-core-common/Editors";
import openInTabIcon from "../../theme/icons/openInNewTab.svg";
import "../lang/contentImageOpenInTab";

import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";

export default class ContentImageOpenInTabUI extends Plugin {
  static readonly pluginName: string = "ContentImageOpenInTabUI";
  static readonly #logger: Logger = LoggerProvider.getLogger(ContentImageOpenInTabUI.pluginName);

  async init(): Promise<void> {
    const logger = ContentImageOpenInTabUI.#logger;
    const pluginName = ContentImageOpenInTabUI.pluginName;
    const startTimestamp = performance.now();

    logger.debug(`Initializing ${pluginName}...`);
    this.#createToolbarLinkImageButton();
    logger.debug(`Initialized ${pluginName} within ${performance.now() - startTimestamp} ms.`);
  }

  #createToolbarLinkImageButton() {
    const editor: EditorWithUI = this.editor as EditorWithUI;
    const { ui } = requireEditorWithUI(this.editor);
    const t = editor.t;

    ui.componentFactory.add("contentImageOpenInTab", (locale) => {
      const button = new ButtonView(locale);

      button.set({
        isEnabled: true,
        label: t("Open in tab"),
        icon: openInTabIcon,
        tooltip: true,
      });

      // Bind button to the command.
      // TODO
      //button.bind( 'isEnabled' ).to( openInTabCommand, 'isEnabled' );

      this.listenTo(button, "execute", () => {
        //TODO
        console.log("open image in tab");
      });

      return button;
    });
  }
}
