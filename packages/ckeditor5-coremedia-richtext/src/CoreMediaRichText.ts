import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LoggerProvider from "@coremedia/coremedia-utils/logging/LoggerProvider";
import Logger from "@coremedia/coremedia-utils/logging/Logger";
import RichTextDataProcessor from "./RichTextDataProcessor";
import { COREMEDIA_RICHTEXT_PLUGIN_NAME } from "./Constants";

export default class CoreMediaRichText extends Plugin {
  static readonly pluginName: string = COREMEDIA_RICHTEXT_PLUGIN_NAME;
  private readonly logger: Logger = LoggerProvider.getLogger(COREMEDIA_RICHTEXT_PLUGIN_NAME);

  constructor(editor: Editor) {
    super(editor);
  }

  init(): Promise<void> | null {
    const startTimestamp = performance.now();

    this.logger.info(`Initializing ${CoreMediaRichText.pluginName}...`, );

    this.editor.data.processor = new RichTextDataProcessor(this.editor);

    this.logger.info(`Initialized ${CoreMediaRichText.pluginName} within ${performance.now() - startTimestamp} ms.`);

    return null;
  }
}
