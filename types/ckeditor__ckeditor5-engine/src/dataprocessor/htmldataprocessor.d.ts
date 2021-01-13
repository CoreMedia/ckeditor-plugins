import DataProcessor from "./dataprocessor";
import ViewDocument from "../view/document";
import ViewDocumentFragment from "../view/documentfragment";
import { MatcherPattern } from "../view/matcher";

/**
 * The HTML data processor class. This data processor implementation uses HTML
 * as input and output data.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_dataprocessor_htmldataprocessor-HtmlDataProcessor.html">Class HtmlDataProcessor (engine/dataprocessor/htmldataprocessor~HtmlDataProcessor) - CKEditor 5 API docs</a>
 */
export default class HtmlDataProcessor implements DataProcessor {
  /**
   * Creates a new instance of the HTML data processor class.
   *
   * @param {Document} document The view document instance.
   */
  constructor(document: ViewDocument);

  registerRawContentMatcher(pattern: MatcherPattern): void;

  toData(viewFragment: ViewDocumentFragment): string;

  toView(data: string): ViewDocumentFragment | null;
}
