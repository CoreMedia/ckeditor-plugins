import { DataProcessor } from "@ckeditor/ckeditor5-engine/src/dataprocessor/dataprocessor";
import { COREMEDIA_RICHTEXT_PLUGIN_NAME } from "../Constants";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import ViewDocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import ViewNode from "@ckeditor/ckeditor5-engine/src/view/node";
import { Element, HtmlDataProcessor } from "@ckeditor/ckeditor5-engine";
import { Editor } from "@ckeditor/ckeditor5-core";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { ToViewHelpers } from "./ToViewConversion";
import { Conversion } from "./Conversion";
import { HtmlDomToRichTextConverter } from "./HtmlDomToRichTextConverter";

// TODO[poc] Idea: If possible, the new data processor could also handle
// TODO[poc] registering known elements to GHS. If to do this, should be
// TODO[poc] configurable, though, as GHS is not always recommended.
// TODO[poc] Rough idea starting here: https://github.com/ckeditor/ckeditor5/issues/6557
// TODO[poc] In case we need priorities, consider using: https://ckeditor.com/docs/ckeditor5/35.2.1/api/module_utils_priorities-PriorityString.html
// TODO[poc] For matching we may use https://ckeditor.com/docs/ckeditor5/35.2.1/api/module_engine_view_matcher-MatcherPattern.html
// TODO[poc] Conversion API: https://ckeditor.com/docs/ckeditor5/35.2.1/api/module_engine_conversion_conversion-Conversion.html
export class RichTextDataProcessor implements DataProcessor {
  static readonly #logger: Logger = LoggerProvider.getLogger(COREMEDIA_RICHTEXT_PLUGIN_NAME);
  readonly #delegate: HtmlDataProcessor;
  readonly #rtConverter = new HtmlDomToRichTextConverter();
  readonly conversion: Conversion = {} as Conversion;

  constructor(editor: Editor) {
    this.#delegate = createHtmlDataProcessor(editor);
    // TODO[poc] Config should be done somewhere else.
    this.conversion.dataElementToViewElementByClass({
      view: "h1",
      data: "p",
      class: "p--heading-1",
    });
  }

  registerRawContentMatcher(pattern: MatcherPattern): void {
    this.#delegate.registerRawContentMatcher(pattern);
  }

  toData(viewFragment: ViewDocumentFragment): string {
    const { domConverter, htmlWriter } = this.#delegate;
    // Convert view DocumentFragment to DOM DocumentFragment.
    // @ts-expect-error – Error in Typings at DefinitelyTyped. Exact Copy & Paste from HtmlDataProcessor.
    const domFragment: DocumentFragment = domConverter.viewToDom(viewFragment);

    // Convert DOM DocumentFragment to HTML output.
    return htmlWriter.getHtml(domFragment);
  }

  toView(data: string): ViewDocumentFragment | ViewNode | null {
    const { domConverter, htmlWriter } = this.#delegate;
    // Convert input HTML data to DOM DocumentFragment.
    const domFragment = this.#toDom(data);

    // Convert DOM DocumentFragment to view DocumentFragment.
    return domConverter.domToView(domFragment);
  }

  /**
   * Converts an HTML string to its DOM representation. Returns a document fragment containing nodes parsed from
   * the provided data.
   *
   * @private
   * @param {string} data
   * @returns {DocumentFragment}
   */
  #toDom(data: string): DocumentFragment {
    const { domParser } = this.#delegate;

    // Wrap data with a <body> tag so leading non-layout nodes (like <script>, <style>, HTML comment)
    // will be preserved in the body collection.
    // Do it only for data that is not a full HTML document.
    if (!data.match(/<(?:html|body|head|meta)(?:\s[^>]*)?>/i)) {
      data = `<body>${data}</body>`;
    }

    const document = domParser.parseFromString(data, "text/html");
    const fragment = document.createDocumentFragment();
    const bodyChildNodes = document.body.childNodes;

    while (bodyChildNodes.length > 0) {
      fragment.appendChild(bodyChildNodes[0]);
    }

    return fragment;
  }

  useFillerType(type: "default" | "marked"): void {
    this.#delegate.useFillerType(type);
  }
}

const createHtmlDataProcessor = (editor: Editor): HtmlDataProcessor => new HtmlDataProcessor(editor.data.viewDocument);

export interface ConversionApi {
  /**
   * Document for creating new elements, etc.
   */
  document: Document;
  /**
   * Editor, to access API, if required.
   */
  editor: Editor;
}

export type ElementConversionFunction = (element: Element, conversionApi: ConversionApi) => Element;

export interface ToDataElementToElementConfig {
  view: MatcherPattern;
  data: string | Element | ElementConversionFunction;
  /**
   * We may always give these some priority.
   */
  priority?: PriorityString;
}

export interface ToDataHelpers {
  elementToElement(config: ToDataElementToElementConfig): this;
}

export const toData = Symbol("toData");
export type ToData = typeof toData;

export interface DataElementToViewElementByClassConfig {
  /**
   * Name of element in data view.
   */
  view: string;
  /**
   * Name of element in data.
   */
  data: string;
  /**
   * Reserved class in data, which marks the element as specified by `data`
   * as being element `view` in data view.
   */
  class: string;
  /**
   * We may always give these some priority.
   * TODO[poc] If we have both directions here, which is the priority to take? As alternative we may need two priority strings, or we can assume for one direction the reverse priority.
   */
  priority?: PriorityString;
}
