import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { isRichTextDataProcessor } from "@coremedia/ckeditor5-coremedia-richtext/RichTextDataProcessor";
import { xDiffElements } from "./XDiffElements";

/**
 * Hooks into `ImageInline` and `ImageBlock` plugin, if available and
 * registers additional differencing attributes applied to `<img>` elements.
 *
 * For corresponding CSS rules, it is important to understand, that the
 * `xdiff:changetype` attribute is applied to the surrounding element, like
 * the corresponding `<span class="image-inline">` for inline images.
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
