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

const strike: ElementFilterRule = (params) => {
  params.el.name = "span";
  params.el.attributes["class"] = "strike";
};

export const BASE_TO_DATA_FILTER_RULES: FilterRuleSet = {
  elements: {
    ol: (params) => {
      // Workaround/Fix for CMS-10539 (Error while Saving when deleting in Lists, MSIE11)
      return !(params.el.children.length === 0 || !params.el.getFirst("li"));
    },
    ul: (params) => {
      // Workaround/Fix for CMS-10539 (Error while Saving when deleting in Lists, MSIE11)
      return !(params.el.children.length === 0 || !params.el.getFirst("li"));
    },
    h1: (params) => {
      params.el.name = "p";
      params.el.attributes["class"] = "p--heading-1";
    },
    h2: (params) => {
      params.el.name = "p";
      params.el.attributes["class"] = "p--heading-2";
    },
    h3: (params) => {
      params.el.name = "p";
      params.el.attributes["class"] = "p--heading-3";
    },
    h4: (params) => {
      params.el.name = "p";
      params.el.attributes["class"] = "p--heading-4";
    },
    h5: (params) => {
      params.el.name = "p";
      params.el.attributes["class"] = "p--heading-5";
    },
    h6: (params) => {
      params.el.name = "p";
      params.el.attributes["class"] = "p--heading-6";
    },
    b: (params) => {
      params.el.name = "strong";
    },
    i: (params) => {
      params.el.name = "em";
    },
    u: (params) => {
      params.el.name = "span";
      params.el.attributes["class"] = "underline";
    },
    br: (params) => {
      // Remove obsolete BR, if only element on block level params.el.
      const parent = params.el.parentElement;
      const parentName = parent?.name || "";
      if (!parent || parentName === "div") {
        // somehow, a top-level <br> has been introduced, which is not valid:
        return false;
      }
      // Only checking td, p here, as it was for CKEditor 4. You may argue, that other
      // block level elements should be respected too, though. Change it, if you think so.
      if (["td", "p"].indexOf(parentName) >= 0) {
        return !params.el.isLastNode;
      }
      return true;
    },
    del: strike,
    s: strike,
    strike: strike,
    div: (params) => {
      // We are not applied to root-div. Thus, we have a nested div here, which
      // is not allowed in CoreMedia RichText 1.0.
      params.el.name = "p";
    },
    td: (params) => {
      return !params.el.isEmpty((el, idx, children) => {
        // Only filter, if there is only one child. While it may be argued, if this
        // is useful, this is the behavior as we had it for CKEditor 4.
        if (children.length !== 1) {
          return true;
        }
        if (el.childNodes.length > 1) {
          return true;
        }
        // Ignore, if only one br exists.
        if (el.nodeName.toLowerCase() === "br") {
          return false;
        }
        if (el.nodeName.toLowerCase() !== "p") {
          return true;
        }
        // Only respect p-element, if it is considered non-empty.
        // Because of the check above, we already know, that, the element
        // has at maximum one child.
        return el.hasChildNodes() && el.firstChild?.nodeName.toLowerCase() !== "br";
      });
    },
    th: (params) => {
      params.el.name = "td";
      // TODO[cke] In CKEditor 4 we did not add such a class. May be remove or make configurable.
      params.el.attributes["class"] = "td--heading";
    },
    /*
     * tr/tables rules:
     * ----------------
     *
     * In CKEditor 4 we also had to handle tr and table which may have been
     * emptied during the process. This behavior moved to the after-children
     * behavior, which checks for elements which must not be empty but now
     * are empty.
     */
    tbody: (params) => {
      // If there are more elements at parent than just this tbody, tbody must
      // be removed. Typical scenario: Unknown element <thead> got removed, leaving
      // a structure like <table><tr/><tbody><tr/></tbody></table>. We must now move
      // all nested trs up one level and remove the tbody params.el.
      params.el.replaceByChildren = (params.el.parentElement?.children.length || 0) > 1;
    },
    /*
     * TODO[cke] img/a handling
     *   We don't handle img and a yet, as we don't support internal links or
     *   embedded images yet. Prior to that, we have to find a solution how
     *   to handle updates from CKEditor to src/href attribute which need to
     *   be mapped to xlink:href for CoreMedia RichText 1.0.
     *   The deletion of invalid attributes src/href are handled by after-children
     *   rule implicitly.
     */
    span: (params) => {
      if (!params.el.attributes["class"]) {
        // drop element, but not children
        params.el.replaceByChildren = true;
      }
    },
    "xdiff:span": (params) => {
      params.el.name = "";
    },
  },
};

/**
 * Coremedia Richtext Filter, that are applied before writing it back to the server. Some details about filter
 * execution: (see especially <code>core/htmlparser/params.el.js</code>)
 *
 * <ul>
 * <li>If an element name changes, filtering will be restarted at that node.</li>
 * <li>If a new element is returned, it will replace the current one and processing will be restarted for that node.</li>
 * <li>If false is returned, the element and all its children will be removed.</li>
 * <li>If element name changes to empty, only the element itself will be removed and the children appended to the parent</li>
 * <li>An element is processed first, then its attributes and afterwards its children (if any)</li>
 * <li>Text nodes only support to be changed or removed... but not to be wrapped into some other params.el.</li>
 * <li><code>$</code> and <code>$$</code> are so called generic element rules which are applied after element
 * processing. <code>$</code> is applied prior to filtering the children, while <code>$$</code> is applied
 * after the element and all its children have been processed.
 * The opposite handler is <code>'^'</code> which would be applied before all other element handlers.</li>
 * </ul>
 */
export function createToDataFilterRules(strictness: Strictness = Strictness.STRICT): FilterRuleSet {
  const richTextSchema = new RichTextSchema(strictness);
  return {
    ...BASE_TO_DATA_FILTER_RULES,
    elements: {
      ...BASE_TO_DATA_FILTER_RULES.elements,
      $: (params) => {
        richTextSchema.adjustHierarchy(params.el);
      },
      "$$": (params) => {
        // The hierarchy may have changed after processing children. Thus, we
        // need to check again.
        richTextSchema.adjustHierarchy(params.el);
        // We only expect the element to be possibly removed. replaceByChildren
        // should have been triggered by "before-children" rule.
        if (!params.el.remove) {
          richTextSchema.adjustAttributes(params.el);
        }
      },
    }
  };
}

export default class RichTextDataProcessor implements DataProcessor {
  private readonly logger: Logger = LoggerProvider.getLogger(COREMEDIA_RICHTEXT_PLUGIN_NAME);
  private readonly delegate: HtmlDataProcessor;
  private readonly domConverter: DomConverter;
  private readonly richTextXmlWriter: RichTextXmlWriter;

  private readonly toDataFilter: HtmlFilter;

  constructor(document: ViewDocument) {
    this.delegate = new HtmlDataProcessor(document);
    this.domConverter = new DomConverter(document, { blockFillerMode: "nbsp" });
    this.richTextXmlWriter = new RichTextXmlWriter();
    this.toDataFilter = new HtmlFilter(createToDataFilterRules());
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

    const richTextDocument = RichTextDataProcessor.createCoreMediaRichTextDocument();
    // We use the RichTextDocument at this early stage, so that all created elements
    // already have the required namespace. This eases subsequent processing.
    const domFragment: Node | DocumentFragment = this.domConverter.viewToDom(viewFragment, richTextDocument);
    let fragmentAsStringForDebugging: string = "uninitialized";

    if (this.logger.isDebugEnabled()) {
      fragmentAsStringForDebugging = this.fragmentToString(domFragment);

      this.logger.debug("toData: ViewFragment converted to DOM.", {
        view: viewFragment,
        dom: domFragment,
        domAsString: fragmentAsStringForDebugging,
      });
    }

    richTextDocument.documentElement.appendChild(domFragment);

    const doc = this.toCoreMediaRichTextXml(richTextDocument);
    const xml: string = this.richTextXmlWriter.getXml(doc);

    if (this.logger.isDebugEnabled()) {
      this.logger.debug(`Transformed HTML to RichText within ${performance.now() - startTimestamp} ms:`, {
        in: fragmentAsStringForDebugging,
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
   * Transforms the given document to valid CoreMedia RichText. It is expected,
   * that the document already got created with corresponding namespace.
   *
   * Visible for testing only.
   *
   * @param document the yet unprocessed document
   */
  toCoreMediaRichTextXml(document: Document): Document {
    // TODO[cke] In CKEditor 4 we ALWAYS added the XLINK Namespace, even if no links were contained.
    //   We may require to reintroduce it, possibly by "legacy behavior" configuration option.
    //container.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", XLINK_NAMESPACE);

    this.toDataFilter.applyTo(document.documentElement);
    return document;
  }

  static createCoreMediaRichTextDocument(): Document {
    const doc: Document = document.implementation.createDocument(COREMEDIA_RICHTEXT_NAMESPACE_URI, "div");
    const pi = doc.createProcessingInstruction("xml", 'version="1.0" encoding="utf-8"');
    doc.insertBefore(pi, doc.firstChild);
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
