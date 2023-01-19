import ViewDocument from "@ckeditor/ckeditor5-engine/src/view/document";
import ViewDocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import HtmlDataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor";
import { DataProcessor } from "@ckeditor/ckeditor5-engine/src/dataprocessor/dataprocessor";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import DomConverter from "@ckeditor/ckeditor5-engine/src/view/domconverter";
import RichTextXmlWriter from "./RichTextXmlWriter";
import { COREMEDIA_RICHTEXT_NAMESPACE_URI, COREMEDIA_RICHTEXT_PLUGIN_NAME } from "./Constants";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import ObservableMixin, { Observable } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import mix from "@ckeditor/ckeditor5-utils/src/mix";
import { RuleBasedHtmlDomConverter } from "@coremedia/ckeditor5-dom-converter/RuleBasedHtmlDomConverter";
import { parseRule, RuleConfig, RuleSection } from "@coremedia/ckeditor5-dom-converter/Rule";
import { replaceHeadingsByElementAndClass } from "@coremedia/ckeditor5-dom-converter/rules/ReplaceHeadingsByElementAndClass";
import { preferLangAttribute } from "@coremedia/ckeditor5-dom-converter/rules/PreferLangAttribute";
import { replaceElementByElement } from "@coremedia/ckeditor5-dom-converter/rules/ReplaceElementByElement";
import {
  replaceElementByElementAndClass,
  ReplaceElementByElementAndClassConfig,
} from "@coremedia/ckeditor5-dom-converter/rules/ReplaceElementByElementAndClass";

/**
 * Creates an empty CoreMedia RichText Document with required namespace
 * and processing instructions.
 */
const createCoreMediaRichTextDocument = (): Document => {
  const doc: Document = document.implementation.createDocument(COREMEDIA_RICHTEXT_NAMESPACE_URI, "div");
  const pi = doc.createProcessingInstruction("xml", 'version="1.0" encoding="utf-8"');
  doc.insertBefore(pi, doc.firstChild);
  return doc;
};

/**
 * Creates a new empty HTML document.
 */
const createHtmlDocument = (): Document => document.implementation.createHTMLDocument();

/**
 * Data-Processor for CoreMedia RichText 1.0.
 */
class RichTextDataProcessor implements DataProcessor {
  static readonly #logger: Logger = LoggerProvider.getLogger(COREMEDIA_RICHTEXT_PLUGIN_NAME);
  static readonly #PARSER_ERROR_NAMESPACE = "http://www.w3.org/1999/xhtml";
  readonly #delegate: HtmlDataProcessor;
  readonly #domConverter: DomConverter;
  readonly #richTextXmlWriter: RichTextXmlWriter;
  readonly #domParser: DOMParser;
  readonly #noParserErrorNamespace: boolean;

  readonly toDataRules: RuleSection[] = [];
  readonly toViewRules: RuleSection[] = [];

  constructor(editor: Editor) {
    const document: ViewDocument = editor.data.viewDocument;

    this.#delegate = new HtmlDataProcessor(document);
    // renderingMode: "data" - Fixes observed issue ckeditor/ckeditor5#11786
    this.#domConverter = new DomConverter(document, { renderingMode: "data" });
    this.#richTextXmlWriter = new RichTextXmlWriter();
    this.#domParser = new DOMParser();

    /*
     * We need to mark xdiff:span as elements preserving spaces. Otherwise,
     * CKEditor would consider adding filler nodes inside xdiff:span elements
     * only containing spaces. As xdiff:span is only meant to be used in
     * read-only CKEditor, there is no issue, preventing the filler node
     * from being inserted.
     *
     * Possible alternative: When mapping `xdiff:span` we could replace any
     * whitespaces with non-breakable-spaces. This solution is cumbersome,
     * though, so this solution was the easiest one.
     *
     * See also: ckeditor/ckeditor5#12324
     */
    // @ts-expect-error Typings at DefinitelyTyped only allow this to contain
    // `pre` element. But for TypeScript migration, CKEditor replaced typing
    // by `string[]` instead.
    this.#delegate.domConverter.preElements.push("xdiff:span");

    const parserErrorDocument = this.#domParser.parseFromString("<", "text/xml");
    this.#noParserErrorNamespace =
      RichTextDataProcessor.#PARSER_ERROR_NAMESPACE !==
      parserErrorDocument.getElementsByTagName("parsererror")[0].namespaceURI;

    this.addRule(replaceHeadingsByElementAndClass());
    this.addRule(preferLangAttribute());
    // Failsafe approach. CKEditor 5 uses <strong> by default, thus no need to remap.
    this.addRule(replaceElementByElement({ viewLocalName: "b", dataLocalName: "strong", direction: "toData" }));
    // Note, that this assumes a default CKEditor. It needs to be changed, if
    // a downcast has been installed, so that the view uses `em` instead.
    // See https://github.com/ckeditor/ckeditor5/issues/1394.
    this.addRule(replaceElementByElement({ viewLocalName: "i", dataLocalName: "em", direction: "toView" }));
    this.addRule(replaceElementByElementAndClass({ viewLocalName: "code", dataLocalName: "span" }));
    this.addRule(
      replaceElementByElementAndClass({ viewLocalName: "u", dataLocalName: "span", dataReservedClass: "underline" })
    );
    // Preferred mapping for strikethrough, as `<s>` is the default in CKEditor for strikethrough.
    const strikeMapping: ReplaceElementByElementAndClassConfig = {
      viewLocalName: "div",
      dataLocalName: "p",
      dataReservedClass: "p--div",
    };
    // Support alternative names for strikethrough in data view.
    ["del", "strike"].forEach((viewLocalName) => {
      this.addRule(
        replaceElementByElementAndClass({
          ...strikeMapping,
          viewLocalName,
          direction: "toData",
        })
      );
    });
    this.addRule(replaceElementByElementAndClass(strikeMapping));
    // Fixes naive mapping in old CoreMedia CMS releases, where all `<div>`
    // elements from data view have been mapped to `<p>` in data without applying
    // reverse mapping.
    this.addRule(
      replaceElementByElementAndClass({ viewLocalName: "div", dataLocalName: "p", dataReservedClass: "p--div" })
    );
  }

  registerRawContentMatcher(pattern: MatcherPattern): void {
    this.#delegate.registerRawContentMatcher(pattern);
    this.#domConverter.registerRawContentMatcher(pattern);
  }

  useFillerType(type: "default" | "marked"): void {
    this.#domConverter.blockFillerMode = type === "marked" ? "markedNbsp" : "nbsp";
  }

  /**
   * Transforms CKEditor HTML to CoreMedia RichText 1.0. Note, that
   * to trigger data processor for empty text as well, you have to set the
   * option `trim: 'none'` on `CKEditor.getData()`.
   *
   * @param viewFragment - fragment from view model to process
   * @returns CoreMedia RichText 1.0 XML as string
   */
  toData(viewFragment: ViewDocumentFragment): string {
    const logger = RichTextDataProcessor.#logger;
    const startTimestamp = performance.now();

    const dataDocument = createCoreMediaRichTextDocument();
    const { htmlDomFragment, fragmentAsStringForDebugging } = this.initToData(viewFragment);

    const converter = new RuleBasedHtmlDomConverter(dataDocument, this.toDataRules);
    const converted = converter.convert(htmlDomFragment);
    if (converted) {
      dataDocument.documentElement.append(converted);
    }
    const xml = this.#richTextXmlWriter.getXml(dataDocument);
    logger.debug(`Transformed HTML to RichText within ${performance.now() - startTimestamp} ms:`, {
      in: fragmentAsStringForDebugging,
      out: xml,
    });

    return xml;
  }

  /**
   * Prepares toData transformation.
   *
   * @param viewFragment - view fragment to transform
   * @returns `domFragment` the view DOM-structure to transform;
   * `fragmentAsStringForDebugging` some representation of `domFragment` to be used for debugging — it will only
   * be initialized, if debug logging is turned on.
   */
  initToData(viewFragment: ViewDocumentFragment): {
    htmlDomFragment: Node | DocumentFragment;
    fragmentAsStringForDebugging: string;
  } {
    // @ts-expect-error Typings did not incorporate 35.0.1 signature change yet: 2nd Document Argument is gone.
    const htmlDomFragment: Node | DocumentFragment = this.#domConverter.viewToDom(viewFragment);
    let fragmentAsStringForDebugging = "uninitialized";

    if (RichTextDataProcessor.#logger.isDebugEnabled()) {
      fragmentAsStringForDebugging = this.#fragmentToString(htmlDomFragment);

      RichTextDataProcessor.#logger.debug("toData: ViewFragment converted to DOM.", {
        view: viewFragment,
        dom: htmlDomFragment,
        domAsString: fragmentAsStringForDebugging,
      });
    }
    return {
      htmlDomFragment,
      fragmentAsStringForDebugging,
    };
  }

  /**
   * Transform a fragment into an HTML string for debugging purpose.
   *
   * @param domFragment - fragment to transform
   */
  #fragmentToString(domFragment: Node | DocumentFragment): string {
    return (
      Array.from(domFragment.childNodes)
        .map((cn) => (cn as Element).outerHTML || cn.nodeValue)
        .reduce((result, s) => (result ?? "") + (s ?? "")) ?? ""
    );
  }

  // https://stackoverflow.com/questions/11563554/how-do-i-detect-xml-parsing-errors-when-using-javascripts-domparser-in-a-cross
  #isParserError(parsedDocument: Document) {
    const namespace = RichTextDataProcessor.#PARSER_ERROR_NAMESPACE;
    if (this.#noParserErrorNamespace) {
      // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
      return parsedDocument.getElementsByTagName("parsererror").length > 0;
    }

    return parsedDocument.getElementsByTagNameNS(namespace, "parsererror").length > 0;
  }

  /**
   * Parses the incoming data. On parsing error as well as on empty data, an
   * empty document is returned.
   *
   * @param data - data to parse
   */
  #parseData(data: string): Document {
    const logger = RichTextDataProcessor.#logger;

    if (!data) {
      return createCoreMediaRichTextDocument();
    }

    const dataDocument = this.#domParser.parseFromString(declareCoreMediaRichText10Entities(data), "text/xml");

    if (this.#isParserError(dataDocument)) {
      logger.error("Failed parsing data. See debug messages for details.", { data });
      if (logger.isDebugEnabled()) {
        // noinspection InnerHTMLJS
        const parsererror = dataDocument.documentElement.innerHTML;
        logger.debug("Failed parsing data.", { parsererror });
      }
      return createCoreMediaRichTextDocument();
    }

    return dataDocument;
  }

  addRule(config: RuleConfig): void {
    const { toData, toView } = parseRule(config);
    // TODO: Apply sorting.
    if (toData) {
      this.toDataRules.push(toData);
    }
    if (toView) {
      this.toViewRules.push(toView);
    }
  }

  toView(data: string): ViewDocumentFragment | null {
    const logger = RichTextDataProcessor.#logger;
    const startTimestamp = performance.now();

    const dataDocument = this.#parseData(data);
    const htmlDocument = createHtmlDocument();

    const converter = new RuleBasedHtmlDomConverter(htmlDocument, this.toViewRules);
    const range = dataDocument.createRange();
    range.selectNodeContents(dataDocument.documentElement);
    const dataFragment = range.extractContents();
    const converted = converter.convert(dataFragment);

    if (converted) {
      htmlDocument.body.append(converted);
    }

    const { innerHTML } = htmlDocument.body;

    // Workaround for CoreMedia/ckeditor-plugins#40: Remove wrong closing tags
    // for singleton elements such as `<img>` and `<br>`. A better fix would
    // fix the serialization issue instead.
    // For now, we just remove (in HTML) obsolete dangling closing tag
    // for the affected elements.
    // TODO: Validate, if still required.
    const dataView = innerHTML.replaceAll(/<\/(?:img|br)>/g, "");

    const viewFragment = this.#delegate.toView(dataView);

    if (logger.isDebugEnabled()) {
      logger.debug(`Transformed RichText to HTML within ${performance.now() - startTimestamp} ms:`, {
        in: data,
        out: dataView,
        viewFragment,
      });
    }

    // Mainly for debugging/testing purpose, we provide the interim
    // processing result with the original data and the intermediate
    // _data view_ as provided after data-processing.
    this.fire("richtext:toView", {
      data,
      dataView,
    });

    return viewFragment;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RichTextDataProcessor extends Observable {}

mix(RichTextDataProcessor, ObservableMixin);

export default RichTextDataProcessor;

/**
 * We must ensure, that entities defined by CoreMedia RichText 1.0 are known
 * prior to parsing the XML. Note, that we cannot add the full DTD, as it
 * makes use of Parameter Entities (to shorten the DTD). These are not supported
 * in inline DTDs.
 *
 * @param xml - XML to parse.
 */
export function declareCoreMediaRichText10Entities(xml: string): string {
  if (!xml) {
    return xml;
  }
  const firstDiv = xml.indexOf("<div");
  if (firstDiv < 0) {
    return xml;
  }
  const preamble = xml.substring(0, firstDiv);
  const remainingXml = xml.substring(firstDiv);
  return `${preamble}<!DOCTYPE div [${COREMEDIA_RICHTEXT_1_0_DTD}]>${remainingXml}`;
}

// noinspection SpellCheckingInspection
export const COREMEDIA_RICHTEXT_1_0_DTD = `
  <!ENTITY nbsp   "&#160;">
  <!ENTITY iexcl  "&#161;">
  <!ENTITY cent   "&#162;">
  <!ENTITY pound  "&#163;">
  <!ENTITY curren "&#164;">
  <!ENTITY yen    "&#165;">
  <!ENTITY brvbar "&#166;">
  <!ENTITY sect   "&#167;">
  <!ENTITY uml    "&#168;">
  <!ENTITY copy   "&#169;">
  <!ENTITY ordf   "&#170;">
  <!ENTITY laquo  "&#171;">
  <!ENTITY not    "&#172;">
  <!ENTITY shy    "&#173;">
  <!ENTITY reg    "&#174;">
  <!ENTITY macr   "&#175;">
  <!ENTITY deg    "&#176;">
  <!ENTITY plusmn "&#177;">
  <!ENTITY sup2   "&#178;">
  <!ENTITY sup3   "&#179;">
  <!ENTITY acute  "&#180;">
  <!ENTITY micro  "&#181;">
  <!ENTITY para   "&#182;">
  <!ENTITY middot "&#183;">
  <!ENTITY cedil  "&#184;">
  <!ENTITY sup1   "&#185;">
  <!ENTITY ordm   "&#186;">
  <!ENTITY raquo  "&#187;">
  <!ENTITY frac14 "&#188;">
  <!ENTITY frac12 "&#189;">
  <!ENTITY frac34 "&#190;">
  <!ENTITY iquest "&#191;">
  <!ENTITY Agrave "&#192;">
  <!ENTITY Aacute "&#193;">
  <!ENTITY Acirc  "&#194;">
  <!ENTITY Atilde "&#195;">
  <!ENTITY Auml   "&#196;">
  <!ENTITY Aring  "&#197;">
  <!ENTITY AElig  "&#198;">
  <!ENTITY Ccedil "&#199;">
  <!ENTITY Egrave "&#200;">
  <!ENTITY Eacute "&#201;">
  <!ENTITY Ecirc  "&#202;">
  <!ENTITY Euml   "&#203;">
  <!ENTITY Igrave "&#204;">
  <!ENTITY Iacute "&#205;">
  <!ENTITY Icirc  "&#206;">
  <!ENTITY Iuml   "&#207;">
  <!ENTITY ETH    "&#208;">
  <!ENTITY Ntilde "&#209;">
  <!ENTITY Ograve "&#210;">
  <!ENTITY Oacute "&#211;">
  <!ENTITY Ocirc  "&#212;">
  <!ENTITY Otilde "&#213;">
  <!ENTITY Ouml   "&#214;">
  <!ENTITY times  "&#215;">
  <!ENTITY Oslash "&#216;">
  <!ENTITY Ugrave "&#217;">
  <!ENTITY Uacute "&#218;">
  <!ENTITY Ucirc  "&#219;">
  <!ENTITY Uuml   "&#220;">
  <!ENTITY Yacute "&#221;">
  <!ENTITY THORN  "&#222;">
  <!ENTITY szlig  "&#223;">
  <!ENTITY agrave "&#224;">
  <!ENTITY aacute "&#225;">
  <!ENTITY acirc  "&#226;">
  <!ENTITY atilde "&#227;">
  <!ENTITY auml   "&#228;">
  <!ENTITY aring  "&#229;">
  <!ENTITY aelig  "&#230;">
  <!ENTITY ccedil "&#231;">
  <!ENTITY egrave "&#232;">
  <!ENTITY eacute "&#233;">
  <!ENTITY ecirc  "&#234;">
  <!ENTITY euml   "&#235;">
  <!ENTITY igrave "&#236;">
  <!ENTITY iacute "&#237;">
  <!ENTITY icirc  "&#238;">
  <!ENTITY iuml   "&#239;">
  <!ENTITY eth    "&#240;">
  <!ENTITY ntilde "&#241;">
  <!ENTITY ograve "&#242;">
  <!ENTITY oacute "&#243;">
  <!ENTITY ocirc  "&#244;">
  <!ENTITY otilde "&#245;">
  <!ENTITY ouml   "&#246;">
  <!ENTITY divide "&#247;">
  <!ENTITY oslash "&#248;">
  <!ENTITY ugrave "&#249;">
  <!ENTITY uacute "&#250;">
  <!ENTITY ucirc  "&#251;">
  <!ENTITY uuml   "&#252;">
  <!ENTITY yacute "&#253;">
  <!ENTITY thorn  "&#254;">
  <!ENTITY yuml   "&#255;">

  <!ENTITY fnof     "&#402;">

  <!ENTITY Alpha    "&#913;">
  <!ENTITY Beta     "&#914;">
  <!ENTITY Gamma    "&#915;">
  <!ENTITY Delta    "&#916;">
  <!ENTITY Epsilon  "&#917;">
  <!ENTITY Zeta     "&#918;">
  <!ENTITY Eta      "&#919;">
  <!ENTITY Theta    "&#920;">
  <!ENTITY Iota     "&#921;">
  <!ENTITY Kappa    "&#922;">
  <!ENTITY Lambda   "&#923;">
  <!ENTITY Mu       "&#924;">
  <!ENTITY Nu       "&#925;">
  <!ENTITY Xi       "&#926;">
  <!ENTITY Omicron  "&#927;">
  <!ENTITY Pi       "&#928;">
  <!ENTITY Rho      "&#929;">
  <!ENTITY Sigma    "&#931;">
  <!ENTITY Tau      "&#932;">
  <!ENTITY Upsilon  "&#933;">
  <!ENTITY Phi      "&#934;">
  <!ENTITY Chi      "&#935;">
  <!ENTITY Psi      "&#936;">
  <!ENTITY Omega    "&#937;">

  <!ENTITY alpha    "&#945;">
  <!ENTITY beta     "&#946;">
  <!ENTITY gamma    "&#947;">
  <!ENTITY delta    "&#948;">
  <!ENTITY epsilon  "&#949;">
  <!ENTITY zeta     "&#950;">
  <!ENTITY eta      "&#951;">
  <!ENTITY theta    "&#952;">
  <!ENTITY iota     "&#953;">
  <!ENTITY kappa    "&#954;">
  <!ENTITY lambda   "&#955;">
  <!ENTITY mu       "&#956;">
  <!ENTITY nu       "&#957;">
  <!ENTITY xi       "&#958;">
  <!ENTITY omicron  "&#959;">
  <!ENTITY pi       "&#960;">
  <!ENTITY rho      "&#961;">
  <!ENTITY sigmaf   "&#962;">
  <!ENTITY sigma    "&#963;">
  <!ENTITY tau      "&#964;">
  <!ENTITY upsilon  "&#965;">
  <!ENTITY phi      "&#966;">
  <!ENTITY chi      "&#967;">
  <!ENTITY psi      "&#968;">
  <!ENTITY omega    "&#969;">
  <!ENTITY thetasym "&#977;">
  <!ENTITY upsih    "&#978;">
  <!ENTITY piv      "&#982;">

  <!ENTITY bull     "&#8226;">
  <!ENTITY hellip   "&#8230;">
  <!ENTITY prime    "&#8242;">
  <!ENTITY Prime    "&#8243;">
  <!ENTITY oline    "&#8254;">
  <!ENTITY frasl    "&#8260;">

  <!ENTITY weierp   "&#8472;">
  <!ENTITY image    "&#8465;">
  <!ENTITY real     "&#8476;">
  <!ENTITY trade    "&#8482;">
  <!ENTITY alefsym  "&#8501;">

  <!ENTITY larr     "&#8592;">
  <!ENTITY uarr     "&#8593;">
  <!ENTITY rarr     "&#8594;">
  <!ENTITY darr     "&#8595;">
  <!ENTITY harr     "&#8596;">
  <!ENTITY crarr    "&#8629;">
  <!ENTITY lArr     "&#8656;">
  <!ENTITY uArr     "&#8657;">
  <!ENTITY rArr     "&#8658;">
  <!ENTITY dArr     "&#8659;">
  <!ENTITY hArr     "&#8660;">

  <!ENTITY forall   "&#8704;">
  <!ENTITY part     "&#8706;">
  <!ENTITY exist    "&#8707;">
  <!ENTITY empty    "&#8709;">
  <!ENTITY nabla    "&#8711;">
  <!ENTITY isin     "&#8712;">
  <!ENTITY notin    "&#8713;">
  <!ENTITY ni       "&#8715;">
  <!ENTITY prod     "&#8719;">
  <!ENTITY sum      "&#8721;">
  <!ENTITY minus    "&#8722;">
  <!ENTITY lowast   "&#8727;">
  <!ENTITY radic    "&#8730;">
  <!ENTITY prop     "&#8733;">
  <!ENTITY infin    "&#8734;">
  <!ENTITY ang      "&#8736;">
  <!ENTITY and      "&#8743;">
  <!ENTITY or       "&#8744;">
  <!ENTITY cap      "&#8745;">
  <!ENTITY cup      "&#8746;">
  <!ENTITY int      "&#8747;">
  <!ENTITY there4   "&#8756;">
  <!ENTITY sim      "&#8764;">
  <!ENTITY cong     "&#8773;">
  <!ENTITY asymp    "&#8776;">
  <!ENTITY ne       "&#8800;">
  <!ENTITY equiv    "&#8801;">
  <!ENTITY le       "&#8804;">
  <!ENTITY ge       "&#8805;">
  <!ENTITY sub      "&#8834;">
  <!ENTITY sup      "&#8835;">
  <!ENTITY nsub     "&#8836;">
  <!ENTITY sube     "&#8838;">
  <!ENTITY supe     "&#8839;">
  <!ENTITY oplus    "&#8853;">
  <!ENTITY otimes   "&#8855;">
  <!ENTITY perp     "&#8869;">
  <!ENTITY sdot     "&#8901;">

  <!ENTITY lceil    "&#8968;">
  <!ENTITY rceil    "&#8969;">
  <!ENTITY lfloor   "&#8970;">
  <!ENTITY rfloor   "&#8971;">
  <!ENTITY lang     "&#9001;">
  <!ENTITY rang     "&#9002;">

  <!ENTITY loz      "&#9674;">

  <!ENTITY spades   "&#9824;">
  <!ENTITY clubs    "&#9827;">
  <!ENTITY hearts   "&#9829;">
  <!ENTITY diams    "&#9830;">

  <!ENTITY quot    "&#34;">
  <!ENTITY amp     "&#38;#38;">
  <!ENTITY lt      "&#38;#60;">
  <!ENTITY gt      "&#62;">
  <!ENTITY apos    "&#39;">

  <!ENTITY OElig   "&#338;">
  <!ENTITY oelig   "&#339;">
  <!ENTITY Scaron  "&#352;">
  <!ENTITY scaron  "&#353;">
  <!ENTITY Yuml    "&#376;">

  <!ENTITY circ    "&#710;">
  <!ENTITY tilde   "&#732;">

  <!ENTITY ensp    "&#8194;">
  <!ENTITY emsp    "&#8195;">
  <!ENTITY thinsp  "&#8201;">
  <!ENTITY zwnj    "&#8204;">
  <!ENTITY zwj     "&#8205;">
  <!ENTITY lrm     "&#8206;">
  <!ENTITY rlm     "&#8207;">
  <!ENTITY ndash   "&#8211;">
  <!ENTITY mdash   "&#8212;">
  <!ENTITY lsquo   "&#8216;">
  <!ENTITY rsquo   "&#8217;">
  <!ENTITY sbquo   "&#8218;">
  <!ENTITY ldquo   "&#8220;">
  <!ENTITY rdquo   "&#8221;">
  <!ENTITY bdquo   "&#8222;">
  <!ENTITY dagger  "&#8224;">
  <!ENTITY Dagger  "&#8225;">
  <!ENTITY permil  "&#8240;">
  <!ENTITY lsaquo  "&#8249;">
  <!ENTITY rsaquo  "&#8250;">
  <!ENTITY euro   "&#8364;">
`;
