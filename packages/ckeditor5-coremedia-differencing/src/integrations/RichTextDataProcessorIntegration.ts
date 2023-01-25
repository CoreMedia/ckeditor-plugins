import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { isRichTextDataProcessor } from "@coremedia/ckeditor5-coremedia-richtext/RichTextDataProcessor";
import { xDiffElements } from "./XDiffElements";

/**
 * If Rich Text Data Processing is enabled, applies a corresponding
 * rule to map `xdiff:span` elements as expected/required.
 */
export class RichTextDataProcessorIntegration extends Plugin {
  static readonly pluginName: string = "RichTextDataProcessorIntegration";

  /**
   * Runs as late initialization to add mapping rules for `xdiff:span`
   * elements. The corresponding rules mainly take care, that no such data
   * are written back to server. Along with that, maps `<xdiff:span/>` (thus,
   * empty span) to `<xdiff:br/>`, as this provides more robustness detecting
   * added or removed line-breaks via CSS selectors in editing view for proper
   * highlighting of differences.
   *
   * Note, that it is important to run this later than `init` phase, as
   * the data-processor itself is applied in `init` phase of plugins.
   */
  afterInit(): void {
    const { editor } = this;
    const { processor } = editor.data;

    if (isRichTextDataProcessor(processor)) {
      processor.addRule(xDiffElements);
    }
  }
}
