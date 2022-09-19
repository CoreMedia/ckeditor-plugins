import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import OpenInTabCommand from "./OpenInTabCommand";
import { reportInitializationProgress } from "@coremedia/ckeditor5-core-common/Plugins";

export default class ContentImageOpenInTabEditing extends Plugin {
  static readonly pluginName: string = "ContentImageOpenInTabEditing";
  static readonly #logger: Logger = LoggerProvider.getLogger(ContentImageOpenInTabEditing.pluginName);

  async init(): Promise<void> {
    const pluginName = ContentImageOpenInTabEditing.pluginName;
    const logger = ContentImageOpenInTabEditing.#logger;
    const editor = this.editor;
    reportInitializationProgress(pluginName, logger, () => {
      editor.commands.add("openImageInTab", new OpenInTabCommand(editor, "xlink-href", "imageInline"));
      editor.commands.add("openLinkInTab", new OpenInTabCommand(editor, "linkHref"));
    });
  }
}
