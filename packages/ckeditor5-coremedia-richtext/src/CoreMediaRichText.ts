import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { COREMEDIA_RICHTEXT_PLUGIN_NAME } from "./Constants";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import { DataProcessor } from "@ckeditor/ckeditor5-engine/src/dataprocessor/dataprocessor";
import { COREMEDIA_RICHTEXT_CONFIG_KEY } from "./CoreMediaRichTextConfig";
import { RichTextDataProcessor } from "./processors/RichTextDataProcessor";
import Legacy10RichTextDataProcessor from "./processors/Legacy10RichTextDataProcessor";

/**
 * Applies a data-processor for CoreMedia RichText 1.0 support.
 */
export default class CoreMediaRichText extends Plugin {
  static readonly pluginName: string = COREMEDIA_RICHTEXT_PLUGIN_NAME;

  init(): void {
    const initInformation = reportInitStart(this);
    const { editor } = this;

    // TODO[poc] Rough sketch for configuration compatibility layer.
    if (this.#isUseLegacy()) {
      this.#setDataProcessor(new Legacy10RichTextDataProcessor(editor));
    } else {
      this.#setDataProcessor(new RichTextDataProcessor(editor));
    }

    reportInitEnd(initInformation);
  }

  #isUseLegacy(): boolean {
    const { editor } = this;
    const { config } = editor;
    // TODO[poc] Very lightweight, almost meaningless check.
    return isCompatibilityConfig(config?.get(COREMEDIA_RICHTEXT_CONFIG_KEY));
  }

  #setDataProcessor(dataProcessor: DataProcessor): void {
    // @ts-expect-error Bad Typing, DefinitelyTyped/DefinitelyTyped#60965
    this.editor.data.processor = dataProcessor;
  }
}

interface CompatibilityConfig {
  /**
   * Idea: Possibly use some semantic versioning here. For proof-of-concept,
   * this is just a trigger flag with its value ignored.
   */
  compatibility: string;
}

const isCompatibilityConfig = (value: unknown): value is CompatibilityConfig => {
  if (!value || typeof value !== "object") {
    return false;
  }
  // A type check could be applied, too, here.
  return value.hasOwnProperty("compatibility");
};
