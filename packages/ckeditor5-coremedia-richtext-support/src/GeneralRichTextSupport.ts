import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import GeneralHtmlSupport from "@ckeditor/ckeditor5-html-support/src/generalhtmlsupport";
import RichTextDataFilter from "./RichTextDataFilter";

/**
 * Wrapper plugin to enable GeneralRichTextSupport based on CKEditor's
 * General HTML Support feature.
 */
class GeneralRichTextSupport extends Plugin {
  static readonly pluginName: string = "GeneralRichTextSupport";
  static readonly #logger: Logger = LoggerProvider.getLogger(GeneralRichTextSupport.pluginName);

  static readonly requires = [GeneralHtmlSupport, RichTextDataFilter];

  constructor(editor: Editor) {
    super(editor);
  }

  init(): Promise<void> | void {
    const logger = GeneralRichTextSupport.#logger;

    logger.info(`Initialized ${GeneralRichTextSupport.pluginName}.`);
  }
}

export default GeneralRichTextSupport;
