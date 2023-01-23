import { Strictness } from "../Strictness";
import { isParentNode } from "@coremedia/ckeditor5-dom-support/ParentNodes";
import { silentSanitationListener } from "./SanitationListener";
import { namespaces } from "../Namespaces";
import { acAny, acEnum, AttributeContent } from "./AttributeContent";
import { allowEmpty, ElementContent, pcdata } from "./ElementContent";
import { parseAttributeDefinitionConfig, ParsedAttributeDefinitionConfig } from "./AttributeDefinitionConfig";
import { ElementConfig } from "./ElementConfig";

const special: ElementContent[] = ["br", "span", "img"];
const phrase: ElementContent[] = ["em", "strong", "sub", "sup"];
const inline: ElementContent[] = ["a", ...special, ...phrase];
const Inline: ElementContent[] = [allowEmpty, pcdata, ...inline];
const lists: ElementContent[] = ["ul", "ol"];
const blocktext: ElementContent[] = ["pre", "blockquote"];
const block: ElementContent[] = ["p", ...lists, ...blocktext, "table"];
const Block: ElementContent[] = [allowEmpty, ...block];
const Flow: ElementContent[] = [allowEmpty, pcdata, ...block, ...inline];
const aContent: ElementContent[] = [allowEmpty, pcdata, ...special, ...phrase];
const preContent: ElementContent[] = [allowEmpty, pcdata, "a", "br", "span", ...phrase];

export const acCData = acAny;
export const nmTokenRegExp = /^[a-zA-Z0-9._\-:]*$/;
export const acNmToken: AttributeContent = {
  validateValue(value: string | null, strictness: Strictness): boolean {
    if (!value || strictness === Strictness.LEGACY) {
      return true;
    }
    return nmTokenRegExp.test(value);
  },
};
export const acLanguageCode = acNmToken;
export const acNumber: AttributeContent = {
  validateValue(value: string | null, strictness: Strictness): boolean {
    if (!value || strictness !== Strictness.STRICT) {
      return true;
    }
    return !isNaN(parseInt(value));
  },
};
export const acUri = acCData;
export const acText = acCData;
export const lengthRegEx = /^\d+%?$/;
export const acLength: AttributeContent = {
  validateValue(value: string | null, strictness: Strictness): boolean {
    if (!value || strictness !== Strictness.STRICT) {
      return true;
    }
    return lengthRegEx.test(value);
  },
};

export const coreClassAttr = parseAttributeDefinitionConfig({ localName: "class", content: acCData });
export const coreAttrs: ParsedAttributeDefinitionConfig[] = [coreClassAttr];
export const i18nLangAttr = parseAttributeDefinitionConfig({ localName: "lang", content: acLanguageCode });
export const i18nXmlLangAttr = parseAttributeDefinitionConfig({
  localName: "lang",
  prefix: "xml",
  content: acLanguageCode,
});
export const i18nDirAttr = parseAttributeDefinitionConfig({ localName: "dir", content: acEnum("ltr", "rtl") });
export const i18nAttrs: ParsedAttributeDefinitionConfig[] = [i18nLangAttr, i18nXmlLangAttr, i18nDirAttr];
export const commonAttrs: ParsedAttributeDefinitionConfig[] = [...coreAttrs, ...i18nAttrs];

export const richTextElementNames = [
  "div",
  "p",
  "ul",
  "ol",
  "li",
  "pre",
  "blockquote",
  "a",
  "span",
  "br",
  "em",
  "strong",
  "sub",
  "sup",
  "img",
  "table",
  "tbody",
  "tr",
  "td",
];
export type RichTextElementName = typeof richTextElementNames[number];
export type SupportedRichTextElements = Record<RichTextElementName, ElementConfig>;

export const divElement = new ElementConfig(Block);

export const pElement = new ElementConfig(Inline, commonAttrs);
export const ulElement = new ElementConfig(["li"], commonAttrs);
export const olElement = new ElementConfig(["li"], commonAttrs);
export const liElement = new ElementConfig(Flow, commonAttrs);
export const preXmlSpaceAttr = parseAttributeDefinitionConfig({
  localName: "space",
  prefix: "xml",
  content: acEnum("preserve"),
  fixed: "preserve",
});
export const preElement = new ElementConfig(preContent, [...commonAttrs, preXmlSpaceAttr]);
export const blockquoteCiteAttr = parseAttributeDefinitionConfig({
  localName: "cite",
  content: acUri,
});
export const blockquoteElement = new ElementConfig(Block, [...commonAttrs, blockquoteCiteAttr]);
export const aXLinkTypeAttr = parseAttributeDefinitionConfig({
  localName: "type",
  prefix: "xlink",
  content: acEnum("simple"),
  fixed: "simple",
});
export const aXLinkHrefAttr = parseAttributeDefinitionConfig({
  localName: "href",
  prefix: "xlink",
  content: acUri,
  required: "",
});
export const aXLinkRoleAttr = parseAttributeDefinitionConfig({ localName: "role", prefix: "xlink", content: acCData });
export const aXLinkTitleAttr = parseAttributeDefinitionConfig({
  localName: "title",
  prefix: "xlink",
  content: acCData,
});
export const aXLinkShowAttr = parseAttributeDefinitionConfig({
  localName: "show",
  prefix: "xlink",
  content: acEnum("new", "replace", "embed", "other", "none"),
});
export const aXLinkActuateAttr = parseAttributeDefinitionConfig({
  localName: "actuate",
  prefix: "xlink",
  content: acEnum("onRequest", "onLoad"),
});
export const aSpecialAttrs = [
  aXLinkTypeAttr,
  aXLinkHrefAttr,
  aXLinkRoleAttr,
  aXLinkTitleAttr,
  aXLinkShowAttr,
  aXLinkActuateAttr,
];
export const aElement = new ElementConfig(aContent, [...commonAttrs, ...aSpecialAttrs]);
export const spanElement = new ElementConfig(Inline, commonAttrs);
export const brElement = new ElementConfig([], coreAttrs);
export const emElement = new ElementConfig(Inline, commonAttrs);
export const strongElement = new ElementConfig(Inline, commonAttrs);
export const subElement = new ElementConfig(Inline, commonAttrs);
export const supElement = new ElementConfig(Inline, commonAttrs);
export const imgAltAttr = parseAttributeDefinitionConfig({ localName: "alt", content: acText, required: "" });
export const imgHeightAttr = parseAttributeDefinitionConfig({ localName: "height", content: acLength });
export const imgWidthAttr = parseAttributeDefinitionConfig({ localName: "width", content: acLength });
export const imgXLinkTypeAttr = parseAttributeDefinitionConfig({
  localName: "type",
  prefix: "xlink",
  content: acEnum("simple"),
  fixed: "simple",
});
export const imgXLinkHrefAttr = parseAttributeDefinitionConfig({
  localName: "href",
  prefix: "xlink",
  content: acUri,
  required: "",
});
export const imgXLinkRoleAttr = parseAttributeDefinitionConfig({
  localName: "role",
  prefix: "xlink",
  content: acCData,
});
export const imgXLinkTitleAttr = parseAttributeDefinitionConfig({
  localName: "title",
  prefix: "xlink",
  content: acCData,
});
export const imgXLinkShowAttr = parseAttributeDefinitionConfig({
  localName: "show",
  prefix: "xlink",
  content: acEnum("embed"),
  fixed: "embed",
});
export const imgXLinkActuateAttr = parseAttributeDefinitionConfig({
  localName: "actuate",
  prefix: "xlink",
  content: acEnum("onLoad"),
  fixed: "onLoad",
});
export const imgSpecialAttrs = [
  imgAltAttr,
  imgHeightAttr,
  imgWidthAttr,
  imgXLinkTypeAttr,
  imgXLinkHrefAttr,
  imgXLinkRoleAttr,
  imgXLinkTitleAttr,
  imgXLinkShowAttr,
  imgXLinkActuateAttr,
];
export const imgElement = new ElementConfig([], [...commonAttrs, ...imgSpecialAttrs]);
export const cellHAlignAttr = parseAttributeDefinitionConfig({
  localName: "align",
  content: acEnum("left", "center", "right"),
});
export const cellVAlignAttr = parseAttributeDefinitionConfig({
  localName: "valign",
  content: acEnum("top", "middle", "bottom", "baseline"),
});
export const tableSummaryAttr = parseAttributeDefinitionConfig({ localName: "summary", content: acText });

export const tableElement = new ElementConfig(["tbody", "tr"], [...commonAttrs, tableSummaryAttr]);
export const tbodyElement = new ElementConfig(["tr"], [...commonAttrs, cellHAlignAttr, cellVAlignAttr]);
export const trElement = new ElementConfig(["td"], [...commonAttrs, cellHAlignAttr, cellVAlignAttr]);

export const tdAbbrAttr = parseAttributeDefinitionConfig({ localName: "abbr", content: acText });
export const tdRowspanAttr = parseAttributeDefinitionConfig({ localName: "rowspan", content: acNumber });
export const tdColspanAttr = parseAttributeDefinitionConfig({ localName: "colspan", content: acNumber });
export const tdElement = new ElementConfig(Flow, [
  ...commonAttrs,
  tdAbbrAttr,
  tdRowspanAttr,
  tdColspanAttr,
  cellHAlignAttr,
  cellVAlignAttr,
]);

/**
 * Supported CoreMedia Rich Text 1.0 elements. Note, that it is expected, that
 * all elements are of the same namespace as the root element.
 */
// DevNote: To support different namespaceURIs of elements, it needs to become
// part of ElementConfig and possibly require some different lookup.
const supportedElements: SupportedRichTextElements = {
  div: divElement,
  p: pElement,
  ul: ulElement,
  ol: olElement,
  li: liElement,
  pre: preElement,
  blockquote: blockquoteElement,
  a: aElement,
  span: spanElement,
  br: brElement,
  em: emElement,
  strong: strongElement,
  sub: subElement,
  sup: supElement,
  img: imgElement,
  table: tableElement,
  tbody: tbodyElement,
  tr: trElement,
  td: tdElement,
};

export class RichTextSanitizer {
  constructor(
    public readonly strictness: Strictness = Strictness.STRICT,
    public readonly listener = silentSanitationListener
  ) {}

  sanitize<T extends Document>(document: T): T | false {
    this.listener.started();
    const { documentElement } = document;
    let result: T | false = document;
    // Regarding Prefix: While supported theoretically, CoreMedia Rich Text 1.0
    // with prefix is mostly unsupported in various layers of CoreMedia CMS.
    if (
      documentElement.localName !== "div" ||
      documentElement.namespaceURI !== namespaces.default ||
      documentElement.prefix
    ) {
      this.listener.fatal(`Invalid document element. Expected: <div>, Action: <${documentElement.localName}>`);
      result = false;
    } else {
      try {
        this.#sanitize(documentElement);
      } catch (e) {
        this.listener.fatal(`Sanitation failed with error: ${e}`, e);
        result = false;
      }
    }
    this.listener.stopped();
    return result;
  }

  #sanitize(element: Element, depth = 0): void {
    this.listener.enteringElement(element, depth);

    if (isParentNode(element)) {
      for (const childElement of element.children) {
        this.#sanitize(childElement, depth + 1);
      }
    }

    const { strictness, listener } = this;
    const { prefix, localName } = element;

    // We don't respect prefixed elements yet. Thus, any prefixed
    // elements are by default considered invalid. This, for example,
    // is true for `<xdiff:span>`. We expect them to be removed when
    // processing the parent element.
    if (!prefix) {
      // If this element is not supported, it is expected to be cleaned up
      // when parent node is processed. This again requires, that the root
      // element gets extra processing applied.
      supportedElements[localName]?.process(element, strictness, listener);
    }

    this.listener.leavingElement(element, depth);
  }
}
