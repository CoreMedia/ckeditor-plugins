import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { requireEditorWithUI } from "@coremedia/ckeditor5-core-common/Editors";
import openInTabIcon from "../../theme/icons/openInNewTab.svg";
import "../lang/contentImageOpenInTab";

import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";
import { DocumentSelection } from "@ckeditor/ckeditor5-engine";
import { ModelUri, requireContentCkeModelUri } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

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

    const openInTabCommand = editor.commands.get("openInTab");
    if (!openInTabCommand) {
      throw new Error('The command "openInTab" is required.');
    }

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
        ContentImageOpenInTabUI.#logger.debug("Button open in tab triggered for an image link.");
        console.log("open image in tab");
        const selection = editor.model.document.selection;
        const ckeModelUri = ContentImageOpenInTabUI.#getUriPathFromSelection(selection);
        ContentImageOpenInTabUI.#logger.debug("Open in tab, found a valid ModelUri in selection", ckeModelUri);
        openInTabCommand.execute(ckeModelUri);
      });

      return button;
    });
  }

  static #getUriPathFromSelection(selection: DocumentSelection): ModelUri | undefined {
    const selectedElement = selection.getSelectedElement();
    const xlinkHrefAttribute = selectedElement?.getAttribute("xlink-href") as string; //TODO: Constant for xlink-href
    if (!xlinkHrefAttribute) {
      return undefined;
    }
    return requireContentCkeModelUri(xlinkHrefAttribute);
  }
}
