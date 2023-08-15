import {
  DataProcessor,
  HtmlDataProcessor,
  MatcherPattern,
  ViewDocument,
  ViewDocumentFragment,
} from "@ckeditor/ckeditor5-engine";

import { bbcode2html } from "./bbcode2html/bbcode2html";
import { html2bbcode } from "./html2bbcode/html2bbcode";

/**
 * Data processor for BBCode.
 * This data processor converts BBCode to HTML and uses the HtmlDataProcessor
 * to generate the resulting view tree.
 */
export default class BBCodeDataProcessor implements DataProcessor {
  /**
   * HTML data processor used to process HTML produced by the third-party @bbob/html converter.
   */
  readonly #htmlDataProcessor: HtmlDataProcessor;

  /**
   * Creates a new instance of the BBCode data processor class.
   */
  constructor(document: ViewDocument) {
    this.#htmlDataProcessor = new HtmlDataProcessor(document);
  }

  /**
   * Converts the provided BBCode string to a data view tree.
   *
   * @param data - The BBCode string.
   * @returns The converted view element.
   */
  public toView(data: string): ViewDocumentFragment {
    const html = bbcode2html(data);
    return this.#htmlDataProcessor.toView(html);
  }

  /**
   * Converts the provided {@link module:engine/view/documentfragment~DocumentFragment} to data format &mdash; in this
   * case to a BBCode string.
   *
   * @param viewFragment - The viewFragment.
   * @returns BBCode string.
   */
  public toData(viewFragment: ViewDocumentFragment): string {
    const html = this.#htmlDataProcessor.toData(viewFragment);
    return html2bbcode(html);
  }

  /**
   * Registers a {@link module:engine/view/matcher~MatcherPattern} for view elements whose content should be treated as raw data
   * and not processed during the conversion from Markdown to view elements.
   *
   * The raw data can be later accessed by a
   * {@link module:engine/view/element~Element#getCustomProperty custom property of a view element} called `"$rawContent"`.
   *
   * @param pattern - The pattern matching all view elements whose content should
   * be treated as raw data.
   */
  public registerRawContentMatcher(pattern: MatcherPattern): void {
    this.#htmlDataProcessor.registerRawContentMatcher(pattern);
  }

  /**
   * This method does not have any effect on the data processor result. It exists for compatibility with the
   * {@link module:engine/dataprocessor/dataprocessor~DataProcessor `DataProcessor` interface}.
   */
  public useFillerType(): void {
    this.#htmlDataProcessor.useFillerType("default");
  }
}
