import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LoggerProvider from "@coremedia/coremedia-utils/dist/logging/LoggerProvider";
import Logger from "@coremedia/coremedia-utils/src/logging/Logger";
import CMRichTextDataProcessor from "./CMRichTextDataProcessor";

export default class CMRichText extends Plugin {
  static readonly pluginName: string = "CMRichText";
  private readonly logger: Logger = LoggerProvider.getLogger(CMRichText.pluginName);

  constructor(editor: Editor) {
    super(editor);
    editor.data.processor = new CMRichTextDataProcessor(editor.data.viewDocument);
  }

  init(): Promise<void> | null {
    this.logger.info("Initializing", CMRichText.pluginName);
    return null;
  }
}
