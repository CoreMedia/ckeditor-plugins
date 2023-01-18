import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import LegacyRichTextDataProcessor from "./LegacyRichTextDataProcessor";
import { COREMEDIA_RICHTEXT_PLUGIN_NAME } from "./Constants";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import { DataProcessor } from "@ckeditor/ckeditor5-engine/src/dataprocessor/dataprocessor";
import RichTextDataProcessor from "./RichTextDataProcessor";

/**
 * Applies a data-processor for CoreMedia RichText 1.0 support.
 */
export default class CoreMediaRichText extends Plugin {
  static readonly pluginName: string = COREMEDIA_RICHTEXT_PLUGIN_NAME;

  init(): void {
    const initInformation = reportInitStart(this);
    let dataProcessor: DataProcessor;

    // TODO: Replace by compat flag.
    if (false) {
      dataProcessor = new LegacyRichTextDataProcessor(this.editor);
    } else {
      dataProcessor = new RichTextDataProcessor(this.editor);
    }

    // @ts-expect-error Bad Typing, DefinitelyTyped/DefinitelyTyped#60965
    this.editor.data.processor = dataProcessor;

    reportInitEnd(initInformation);
  }
}
