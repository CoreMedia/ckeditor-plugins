import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import GeneralHtmlSupport from "@ckeditor/ckeditor5-html-support/src/generalhtmlsupport";

export default class GeneralRichTextSupport extends Plugin {
  static readonly pluginName: string = "GeneralRichTextSupport";
  static readonly #logger: Logger = LoggerProvider.getLogger(GeneralRichTextSupport.pluginName);

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [GeneralHtmlSupport];
  }

  constructor(editor: Editor) {
    super(editor);
  }

  init(): Promise<void> | null {
    const logger = GeneralRichTextSupport.#logger;
    const startTimestamp = performance.now();

    logger.info(`Initializing ${GeneralRichTextSupport.pluginName}...`);
    logger.info(
      `Initialized ${GeneralRichTextSupport.pluginName} within ${performance.now() - startTimestamp} ms.`
    );

    return null;
  }
}
