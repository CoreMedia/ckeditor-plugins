import ViewDocumentFragment from "../view/documentfragment";
import { MatcherPattern } from "../view/matcher";

/**
 * The data processor interface. It should be implemented by actual data processors.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_dataprocessor_dataprocessor-DataProcessor.html">Interface DataProcessor (engine/dataprocessor/dataprocessor~DataProcessor) - CKEditor 5 API docs</a>
 */
export default interface DataProcessor {
  /**
   * Registers a MatcherPattern for view elements whose content should be treated as a raw data
   * and it's content should be converted to Element.getCustomProperty() view element custom property}
   * `"$rawContent"` while converting view.
   *
   * @param {MatcherPattern} pattern Pattern matching all view elements whose content should
   * be treated as plain text.
   */
  registerRawContentMatcher(pattern: MatcherPattern): void;

  /**
   * Converts a document fragment to data.
   *
   * @param {ViewDocumentFragment} fragment The document fragment to be processed.
   * @returns {*}
   */
  toData(fragment: ViewDocumentFragment): any;

  /**
   * Converts the data to a document fragment.
   *
   * @param {*} data The data to be processed.
   * @returns {ViewDocumentFragment}
   */
  toView(data: any): ViewDocumentFragment | null;
}
