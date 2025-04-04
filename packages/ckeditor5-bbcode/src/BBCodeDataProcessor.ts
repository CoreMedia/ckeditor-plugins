import {
  DataProcessor,
  DomConverter,
  HtmlDataProcessor,
  MatcherPattern,
  ViewDocument,
  ViewDocumentFragment,
} from "ckeditor5";
import { bbcode2html } from "./bbcode2html";
import { html2bbcode } from "./html2bbcode";
import { BBCodeProcessingRule } from "./rules/BBCodeProcessingRule";
import { bbCodeDefaultRules } from "./rules/bbCodeDefaultRules";
import { bbCodeLogger } from "./BBCodeLogger";
const fragmentToString = (domFragment: Node | DocumentFragment): string =>
  Array.from(domFragment.childNodes)
    .map((cn) => (cn as Element).outerHTML || cn.nodeValue)
    .reduce((result, s) => (result ?? "") + (s ?? "")) ?? "";

/**
 * Data processor for BBCode.
 *
 * This data processor converts BBCode to HTML and uses the HtmlDataProcessor
 * to generate the resulting view tree.
 */
export class BBCodeDataProcessor implements DataProcessor {
  /**
   * HTML data processor used to process HTML produced by the third-party
   * `@bbob/html` converter.
   */
  readonly #htmlDataProcessor: HtmlDataProcessor;
  /**
   * DOM-Converter used to prepare incoming data view in `toData` processing
   * prior to transforming HTML to BBCode.
   */
  readonly #domConverter: DomConverter;

  /**
   * Rules to apply in data processing. Note that, as we use a third party
   * library for BBCode to HTML processing (`toView` processing), rules are
   * only applied in `toData` processing. Only the supported tags are respected
   * as a configuration option of the `toView` processing.
   */
  readonly #rules: BBCodeProcessingRule[] = bbCodeDefaultRules;

  /**
   * Supported BBCode tags. Used for allowing BBCode tags during
   * `toView` processing.
   */
  readonly #supportedBBCodeTags: string[];

  /**
   * Creates a new instance of the BBCode data processor class.
   */
  constructor(document: ViewDocument) {
    this.#htmlDataProcessor = new HtmlDataProcessor(document);
    // Remember and re-use DOM converter.
    this.#domConverter = this.#htmlDataProcessor.domConverter;
    const supportedTags = this.#rules.flatMap((r) => r.tags ?? ([] as string[]));
    this.#supportedBBCodeTags = Array.from(new Set(supportedTags));
  }

  /**
   * Adds a new rule to the data processing.
   *
   * @param rule - rule to add
   */
  addRule(rule: BBCodeProcessingRule): void {
    this.#rules.push(rule);
    rule.tags?.forEach((tag) => {
      if (!this.#supportedBBCodeTags.includes(tag)) {
        this.#supportedBBCodeTags.push(tag);
      }
    });
  }

  /**
   * Adds new rules to the data processing.
   *
   * @param rules - rules to add
   */
  addRules(rules: BBCodeProcessingRule[]): void {
    rules.forEach((rule) => this.addRule(rule));
  }

  /**
   * Converts the provided BBCode string to a data view tree.
   *
   * @param data - The BBCode string.
   * @returns The converted view element.
   */
  public toView(data: string): ViewDocumentFragment {
    const logger = bbCodeLogger;
    const startTimestamp = performance.now();
    const html = bbcode2html(data, this.#supportedBBCodeTags);
    const viewFragment = this.#htmlDataProcessor.toView(html);
    if (logger.isDebugEnabled()) {
      logger.debug(`Transformed BBCode to HTML within ${performance.now() - startTimestamp} ms:`, {
        in: data,
        out: html,
        viewFragment,
      });
    }
    return viewFragment;
  }

  /**
   * Converts the provided `DocumentFragment` to data format &mdash; in this
   * case to a BBCode string.
   *
   * @param viewFragment - The viewFragment.
   * @returns BBCode string.
   */
  public toData(viewFragment: ViewDocumentFragment): string {
    const logger = bbCodeLogger;
    const startTimestamp = performance.now();
    const htmlDomFragment: Node | DocumentFragment = this.#domConverter.viewToDom(viewFragment);
    const fragmentAsString = logger.isDebugEnabled() ? fragmentToString(htmlDomFragment) : "uninitialized";
    const bbCodeData = html2bbcode(htmlDomFragment, this.#rules);
    if (logger.isDebugEnabled()) {
      logger.debug(`Transformed HTML to BBCode within ${performance.now() - startTimestamp} ms:`, {
        in: fragmentAsString,
        out: bbCodeData,
      });
    }
    return bbCodeData;
  }

  /**
   * Registers a `MatcherPattern` for view elements whose content should be
   * treated as raw data and not processed during the conversion from generated
   * HTML to view elements.
   *
   * The raw data can be later accessed by a custom property of a view element
   * called `"$rawContent"`.
   *
   * @param pattern - The pattern matching all view elements whose content should
   * be treated as raw data.
   */
  public registerRawContentMatcher(pattern: MatcherPattern): void {
    this.#htmlDataProcessor.registerRawContentMatcher(pattern);
  }

  /**
   * This method does not have any effect on the data processor result. It
   * exists for compatibility with the `DataProcessor` interface.
   */
  public useFillerType(): void {
    this.#htmlDataProcessor.useFillerType("default");
  }
}

/**
 * Type guard for `BBCodeDataProcessor`.
 *
 * Especially meant to be used from plugins, to determine, if a data processor
 * set at CKEditor instance, is the `BBCodeDataProcessor` you may want to
 * add rules to.
 *
 * @param value - value to validate
 */
export const isBBCodeDataProcessor = (value: unknown): value is BBCodeDataProcessor =>
  value instanceof BBCodeDataProcessor;

/**
 * Shorthand for conditionally applying, for example, new rules, if the given
 * value is a `BBCodeDataProcessor`.
 *
 * **Example:**
 *
 * ```typescript
 * ifBBCodeDataProcessor(editor.data)?.addRules([
 *   // …
 * ]);
 * ```
 *
 * @param value - value to validate
 */
export const ifBBCodeDataProcessor = (value: unknown): BBCodeDataProcessor | undefined =>
  isBBCodeDataProcessor(value) ? value : undefined;
