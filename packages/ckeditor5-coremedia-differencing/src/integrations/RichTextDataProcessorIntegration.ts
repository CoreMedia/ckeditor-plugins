import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { isRichTextDataProcessor } from "@coremedia/ckeditor5-coremedia-richtext/RichTextDataProcessor";
import { xDiffElements } from "./XDiffElements";

/**
 * If Rich Text Data Processing is enabled, applies a corresponding
 * rule to map `xdiff:span` elements as expected/required.
 */
export class RichTextDataProcessorIntegration extends Plugin {
  static readonly pluginName: string = "RichTextDataProcessorIntegration";

  afterInit(): void {
    const { editor } = this;
    const { processor } = editor.data;

    if (isRichTextDataProcessor(processor)) {
      processor.addRule(xDiffElements);
    }
  }
}
