import { Plugin } from "@ckeditor/ckeditor5-core";
import V10RichTextDataProcessor from "./compatibility/v10/V10RichTextDataProcessor";
import { COREMEDIA_RICHTEXT_PLUGIN_NAME } from "./Constants";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import { DataProcessor } from "@ckeditor/ckeditor5-engine";
import RichTextDataProcessor from "./RichTextDataProcessor";
import { getCoreMediaRichTextConfig } from "./CoreMediaRichTextConfig";
import { LinkIntegration } from "./integrations/LinkIntegration";

/**
 * Applies a data-processor for CoreMedia RichText 1.0 support.
 */
export default class CoreMediaRichText extends Plugin {
  static readonly pluginName: string = COREMEDIA_RICHTEXT_PLUGIN_NAME;

  static readonly requires = [LinkIntegration];

  init(): void {
    const initInformation = reportInitStart(this);
    const { editor } = this;
    const { config } = editor;
    const parsedConfig = getCoreMediaRichTextConfig(config);
    const { compatibility } = parsedConfig;

    let dataProcessor: DataProcessor;

    switch (compatibility) {
      case "latest":
        dataProcessor = new RichTextDataProcessor(this.editor);
        break;
      case "v10":
        dataProcessor = new V10RichTextDataProcessor(this.editor);
        break;
      default:
        throw new Error(`Incompatible configuration: ${compatibility}`);
    }

    this.editor.data.processor = dataProcessor;

    reportInitEnd(initInformation);
  }
}
