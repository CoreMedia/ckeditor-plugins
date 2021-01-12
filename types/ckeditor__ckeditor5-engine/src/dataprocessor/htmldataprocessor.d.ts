import DataProcessor from "./dataprocessor";
import Document from "../view/document";
import Node from "../view/node";
import DocumentFragment from "../view/documentfragment";
import {MatcherPattern} from "../view/matcher";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_dataprocessor_htmldataprocessor-HtmlDataProcessor.html">Class HtmlDataProcessor (engine/dataprocessor/htmldataprocessor~HtmlDataProcessor) - CKEditor 5 API docs</a>
 */
export default class HtmlDataProcessor implements DataProcessor {
  constructor(document:Document);

  registerRawContentMatcher(pattern: MatcherPattern): void;

  toData(viewFragment: DocumentFragment): string;

  toView(data: string): Node | DocumentFragment | null;
}
