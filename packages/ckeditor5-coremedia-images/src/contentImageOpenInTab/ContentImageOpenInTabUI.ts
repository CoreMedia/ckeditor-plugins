import { ButtonView } from "@ckeditor/ckeditor5-ui";
import { Plugin, Editor } from "@ckeditor/ckeditor5-core";
import openInTabIcon from "../../theme/icons/openInTab.svg";
import "../lang/contentImageOpenInTab";

import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";
import ContentImageEditingPlugin from "../ContentImageEditingPlugin";
import { executeOpenImageInTabCommand, requireOpenImageInTabCommand } from "./OpenImageInTabCommand";
import Logger from "@coremedia/ckeditor5-logging/dist/src/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/dist/src/logging/LoggerProvider";

/**
 * Plugin that registers a 'contentImageOpenInTab' button in
 * the editor's componentFactory to be used in editor toolbars.
 *
 * This button uses the 'openInTabCommand', registered in the
 * ContentImageEditingPlugin, which therefore is required.
 */
export default class ContentImageOpenInTabUI extends Plugin {
  static readonly pluginName = "ContentImageOpenInTabUI" as const;

  static readonly requires = [ContentImageEditingPlugin];

  static readonly #logger: Logger = LoggerProvider.getLogger(ContentImageOpenInTabUI.pluginName);

  init(): void {
    const initInformation = reportInitStart(this);
    this.#createToolbarLinkImageButton(this.editor);
    reportInitEnd(initInformation);
  }

  #createToolbarLinkImageButton(editor: Editor): void {
    const logger = ContentImageOpenInTabUI.#logger;
    const { ui } = editor;
    const t = editor.t;

    const OPEN_IN_TAB_KEYSTROKE = "Ctrl+Shift+O";

    editor.keystrokes.set(OPEN_IN_TAB_KEYSTROKE, (keyEvtData, cancel) => {
      // Prevent focusing the search bar in FF, Chrome and Edge. See https://github.com/ckeditor/ckeditor5/issues/4811.
      cancel();

      void executeOpenImageInTabCommand(editor)
        ?.then((result) => {
          logger.debug("Result for OpenImageInTabCommand by keystroke:", result);
        })
        .catch((reason) => {
          logger.warn("Failed executing OpenImageInTabCommand invoked by keystroke:", reason);
        });
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
        void executeOpenImageInTabCommand(editor)
          ?.then((result) => {
            logger.debug("Result for OpenImageInTabCommand by button click:", result);
          })
          .catch((reason) => {
            logger.warn("Failed executing OpenImageInTabCommand invoked by button click:", reason);
          });
      });
      return button;
    });
  }
}
