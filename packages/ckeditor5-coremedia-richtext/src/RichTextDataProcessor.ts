import ViewDocument from "@ckeditor/ckeditor5-engine/src/view/document";
import ViewDocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import HtmlDataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor";
import DataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/dataprocessor";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import richText2Html from "./richtext2html/richtext2html";
import Logger from "@coremedia/coremedia-utils/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/logging/LoggerProvider";
import DomConverter from "@ckeditor/ckeditor5-engine/src/view/domconverter";
import RichTextXmlWriter from "./RichTextXmlWriter";
import HtmlFilter, { FilterRuleSet } from "@coremedia/ckeditor5-dataprocessor-support/dataprocessor/HtmlFilter";
import RichTextSchema, { Strictness } from "./RichTextSchema";
import { COREMEDIA_RICHTEXT_NAMESPACE_URI, COREMEDIA_RICHTEXT_PLUGIN_NAME } from "./Constants";
import { ElementFilterRule } from "@coremedia/ckeditor5-dataprocessor-support/dataprocessor/MutableElement";

const strike: ElementFilterRule = (element) => {
  element.name = "span";
  element.attributes["class"] = "strike";
};

export default class RichTextDataProcessor implements DataProcessor {
  private readonly logger: Logger = LoggerProvider.getLogger(COREMEDIA_RICHTEXT_PLUGIN_NAME);
  private readonly delegate: HtmlDataProcessor;
  private readonly domConverter: DomConverter;
  private readonly richTextXmlWriter: RichTextXmlWriter;
  /*
   * Todo:
   *   How to stream document-fragments?
   *   What is the input type?
   *   Possibly look-up filter-behavior by CKEditor 4. I think, <null> as return value is meant to delete this node.
   */

  private readonly richTextSchema: RichTextSchema = new RichTextSchema(Strictness.STRICT);

  /**
   * Coremedia Richtext Filter, that are applied before writing it back to the server. Some details about filter
   * execution: (see especially <code>core/htmlparser/element.js</code>)
   *
   * <ul>
   * <li>If an element name changes, filtering will be restarted at that node.</li>
   * <li>If a new element is returned, it will replace the current one and processing will be restarted for that node.</li>
   * <li>If false is returned, the element and all its children will be removed.</li>
   * <li>If element name changes to empty, only the element itself will be removed and the children appended to the parent</li>
   * <li>An element is processed first, then its attributes and afterwards its children (if any)</li>
   * <li>Text nodes only support to be changed or removed... but not to be wrapped into some other element.</li>
   * <li><code>$</code> is a so called generic element rule which is applied after element processing.
   * The opposite handler is <code>'^'</code> which would be applied before all other element handlers.</li>
   * </ul>
   */
  private readonly toDataFilterRules: FilterRuleSet = {
    elements: {
      $: (element) => {
        if (!this.richTextSchema.isAllowedAtParent(element)) {
          // Element is not allowed in CoreMedia Richtext or at least not attached to the given parent:
          // Remove it and attach its children to the parent.
          element.replaceByChildren = true;
        } else {
          this.richTextSchema.adjustAttributes(element);
        }
      },
      ol: (element) => {
        // Workaround/Fix for CMS-10539 (Error while Saving when deleting in Lists, MSIE11)
        return !(element.children.length === 0 || !element.getFirst("li"));
      },
      ul: (element) => {
        // Workaround/Fix for CMS-10539 (Error while Saving when deleting in Lists, MSIE11)
        return !(element.children.length === 0 || !element.getFirst("li"));
      },
      h1: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-1";
      },
      h2: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-2";
      },
      h3: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-3";
      },
      h4: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-4";
      },
      h5: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-5";
      },
      h6: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-6";
      },
      b: (element) => {
        element.name = "strong";
      },
      i: (element) => {
        element.name = "em";
      },
      u: (element) => {
        element.name = "span";
        element.attributes["class"] = "underline";
      },
      br: (element) => {
        // Remove obsolete BR, if only element on block level element.
        // TODO[cke] May be dangerous as we cannot provide a reverse mapping. Possibly remove, as it is a left-over from CKEditor 4.
        const parent = element.parentElement;
        return !(parent && parent.children.length === 1 && ["td", "p", "div"].indexOf(parent.name || ""));
      },
      del: strike,
      s: strike,
      strike: strike,
      div: (element) => {
        // We are not applied to root-div. Thus, we have a nested div here, which
        // is not allowed in CoreMedia RichText 1.0.
        element.name = "p";
      },
      td: (element) => {
        // TODO[cke]: In CKEditor 4 we did some clean-up here. This may be dangerous, as we cannot provide a reverse mapping.
        //   The general question: Do we want to add filtering for clean-up here?
      },
      th: (element) => {
        element.name = "td";
      },
      span: (element) => {
        if (!element.attributes["class"]) {
          // drop element, but not children
          element.name = "";
        }
      },
      "xdiff:span": (element) => {
        element.name = "";
      },
    },
  };

  constructor(document: ViewDocument) {
    this.delegate = new HtmlDataProcessor(document);
    this.domConverter = new DomConverter(document, { blockFillerMode: "nbsp" });
    this.richTextXmlWriter = new RichTextXmlWriter();
  }

  registerRawContentMatcher(pattern: MatcherPattern): void {
    this.delegate.registerRawContentMatcher(pattern);
    this.domConverter.registerRawContentMatcher(pattern);
  }

  /**
   * Transforms CKEditor HTML to CoreMedia RichText 1.0. Note, that in order
   * to trigger data processor for empty text as well, you have to set the
   * option `trim: 'none'` on `CKEditor.getData()`.
   *
   * @param viewFragment fragment from view model to process
   * @return CoreMedia RichText 1.0 XML as string
   */
  toData(viewFragment: ViewDocumentFragment): string {
    const startTimestamp = performance.now();

    const domFragment: Node | DocumentFragment = this.domConverter.viewToDom(viewFragment, document);
    let fragmentAsString: string = "uninitialized";

    if (this.logger.isDebugEnabled()) {
      fragmentAsString = this.fragmentToString(domFragment);

      this.logger.debug("toData: ViewFragment converted to DOM.", {
        view: viewFragment,
        dom: domFragment,
        domAsString: fragmentAsString,
      });
    }
    const doc = this.toCoreMediaRichTextXml(domFragment);
    const xml: string = this.richTextXmlWriter.getXml(doc);

    if (this.logger.isDebugEnabled()) {
      this.logger.debug(`Transformed HTML (namespace: ${domFragment.ownerDocument?.documentElement.namespaceURI}) to RichText (namespace: ${doc.documentElement.namespaceURI}) within ${performance.now() - startTimestamp} ms:`, {
        in: fragmentAsString,
        out: xml,
      });
    }
    return xml;
  }

  private fragmentToString(domFragment: Node | DocumentFragment): string {
    return Array.from(domFragment.childNodes)
      .map((cn) => (<Element>cn).outerHTML || cn.nodeValue)
      .reduce((result, s) => (result || "") + (s || "")) || "";
  }

  /**
   * Visible for testing.
   * @param domFragment fragment to transform
   * @return CoreMedia RichText XML Document
   */
  toCoreMediaRichTextXml(domFragment: Node | DocumentFragment): Document {
    const htmlFilter = new HtmlFilter(this.toDataFilterRules);

    const doc: Document = document.implementation.createDocument(COREMEDIA_RICHTEXT_NAMESPACE_URI, "div");
    // TODO[cke] Possibly provide config option OmitProcessingInstruction or (similar to C#) OmitXmlDeclaration)
    const pi = doc.createProcessingInstruction('xml', 'version="1.0" encoding="utf-8"');
    doc.insertBefore(pi, doc.firstChild);

    const container = doc.documentElement;
    // TODO[cke] In CKEditor 4 we ALWAYS added the XLINK Namespace, even if no links were contained.
    //   We may require to reintroduce it, possibly by "legacy behavior" configuration option.
    //container.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", XLINK_NAMESPACE);
    container.appendChild(domFragment);

    htmlFilter.applyTo(container);
    return doc;
  }

  toView(data: string): ViewDocumentFragment | null {
    const html: string = this.richTextToHtml(data);
    return this.delegate.toView(html);
  }

  private richTextToHtml(data: string): string {
    const startTimestamp = performance.now();
    const html: string = richText2Html(data);
    this.logger.debug("Transformed RichText to HTML:", {
      in: data,
      out: html,
      milliseconds: performance.now() - startTimestamp,
    });
    return html;
  }
}
