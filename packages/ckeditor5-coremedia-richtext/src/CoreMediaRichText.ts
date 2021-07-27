import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { LoggerProvider, Logger } from "@coremedia/coremedia-utils/index";
import RichTextDataProcessor from "./RichTextDataProcessor";
import { COREMEDIA_RICHTEXT_PLUGIN_NAME } from "./Constants";

export default class CoreMediaRichText extends Plugin {
  static readonly pluginName: string = COREMEDIA_RICHTEXT_PLUGIN_NAME;
  static readonly #logger: Logger = LoggerProvider.getLogger(COREMEDIA_RICHTEXT_PLUGIN_NAME);

  constructor(editor: Editor) {
    super(editor);
  }

  init(): Promise<void> | null {
    const logger = CoreMediaRichText.#logger;
    const startTimestamp = performance.now();

    logger.info(`Initializing ${CoreMediaRichText.pluginName}...`, );

    this.editor.data.processor = new RichTextDataProcessor(this.editor);

    logger.info(`Initialized ${CoreMediaRichText.pluginName} within ${performance.now() - startTimestamp} ms.`);

    return null;
  }
}
