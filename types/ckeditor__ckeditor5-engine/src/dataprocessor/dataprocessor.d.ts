import DocumentFragment from "../view/documentfragment";
import {MatcherPattern} from "../view/matcher";
import Node from "../view/node";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_dataprocessor_dataprocessor-DataProcessor.html">Interface DataProcessor (engine/dataprocessor/dataprocessor~DataProcessor) - CKEditor 5 API docs</a>
 */
export default interface DataProcessor {
  registerRawContentMatcher(pattern: MatcherPattern): void;

  toData(fragment: DocumentFragment): any;

  toView(data: any): Node | DocumentFragment | null;
}
