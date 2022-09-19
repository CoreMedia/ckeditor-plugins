import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { requireEditorWithUI } from "@coremedia/ckeditor5-core-common/Editors";
import openInTabIcon from "../../theme/icons/openInNewTab.svg";
import "../lang/contentImageOpenInTab";

import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";
import { DocumentSelection } from "@ckeditor/ckeditor5-engine";
import {
  ModelUri,
  requireContentCkeModelUri,
  requireContentUriPath,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { reportInitializationProgress } from "@coremedia/ckeditor5-core-common/Plugins";
import WorkAreaService from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/WorkAreaService";
import { serviceAgent } from "@coremedia/service-agent";
import WorkAreaServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/WorkAreaServiceDescriptor";

export default class ContentImageOpenInTabUI extends Plugin {
  static readonly pluginName: string = "ContentImageOpenInTabUI";
  static readonly #logger: Logger = LoggerProvider.getLogger(ContentImageOpenInTabUI.pluginName);

  async init(): Promise<void> {
    const logger = ContentImageOpenInTabUI.#logger;
    const pluginName = ContentImageOpenInTabUI.pluginName;
    const editor = this.editor;
    reportInitializationProgress(pluginName, logger, () => {
      this.#createToolbarLinkImageButton(editor as EditorWithUI);
    });
  }

  #createToolbarLinkImageButton(editor: EditorWithUI): void {
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

      // TODO: Bind button to the command.
      // Evaluate if it is possible to implement the isEnabled of the command that it works with the document selection
      // and is still reusable in link context.
      // Challenge is that there are different model attributes with the content uri.
      // in case of links the model attribute linkHref has to be used in image context the xlink-href has to be used.
      //button.bind( 'isEnabled' ).to( openInTabCommand, 'isEnabled' );
      const selection = editor.model.document.selection;
      ContentImageOpenInTabUI.bindEnabledToSelection(button, selection);

      this.listenTo(button, "execute", () => {
        ContentImageOpenInTabUI.#logger.debug("Button open in tab triggered for an image link.");
        console.log("open image in tab");
        const ckeModelUri = ContentImageOpenInTabUI.#getUriPathFromSelection(selection);
        ContentImageOpenInTabUI.#logger.debug("Open in tab, found a valid ModelUri in selection", ckeModelUri);
        openInTabCommand.execute(ckeModelUri);
      });
      return button;
    });
  }

  static bindEnabledToSelection(button: ButtonView, selection: DocumentSelection): void {
    const logger = ContentImageOpenInTabUI.#logger;

    selection.on("change", () => {
      const selectedElement = selection.getSelectedElement();
      if (!selectedElement) {
        button.isEnabled = false;
        return;
      }
      if (!selectedElement.hasAttribute("xlink-href")) {
        logger.debug(
          "Actual selected element has no xlink-href attribute but the following attributes ",
          selectedElement,
          Array.from(selectedElement.getAttributeKeys())
        );
        button.isEnabled = false;
        return;
      }
      logger.debug(
        "Found a xlink-href attribute, will ask the WorkAreaService if the selected element may be opened in tab.",
        selection.getSelectedElement()
      );

      const modelUri = ContentImageOpenInTabUI.#getUriPathFromSelection(selection);
      if (!modelUri) {
        logger.debug("Selected element has no valid uri set. Button is disabled.");
        button.isEnabled = false;
        return;
      }

      const uriPath = requireContentUriPath(modelUri);
      // TODO: WorkAreaService is not observable and canBeOpened might evaluate to true
      // and stays true even if it should recalculate to false.
      // To solve this either the WorkAreaService has to provide an observable or another
      // service has to be implemented.
      serviceAgent
        .fetchService<WorkAreaService>(new WorkAreaServiceDescriptor())
        .then((workAreaService: WorkAreaService): void => {
          workAreaService
            .canBeOpenedInTab([uriPath])
            .then((canBeOpened: unknown) => {
              ContentImageOpenInTabUI.#logger.debug("May be opened in tab: ", canBeOpened);
              button.isEnabled = canBeOpened as boolean;
            })
            .catch((error): void => {
              ContentImageOpenInTabUI.#logger.warn(error);
              button.isEnabled = false;
            });
        });
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
