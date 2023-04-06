import { ActiveStrictness, Strictness } from "../Strictness";
import { acCData, acEnum, acNmToken, AttributeContent } from "./AttributeContent";
import { allowEmpty, ElementContent, pcdata } from "./ElementContent";
import { parseAttributeDefinitionConfig, ParsedAttributeDefinitionConfig } from "./AttributeDefinitionConfig";
import { ElementConfig } from "./ElementConfig";

/**
 * List of well known CoreMedia Rich Text 1.0 element names.
 */
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
/**
 * A well-known CoreMedia Rich Text 1.0 element name.
 */
export type RichTextElementName = (typeof richTextElementNames)[number];
/**
 * Type for supported rich text elements and their configurations according
 * to the CoreMedia RichText 1.0 DTD.
 */
export type SupportedRichTextElements = Record<RichTextElementName, ElementConfig>;

/**
 * ```text
 * <!ENTITY % LanguageCode "NMTOKEN">
 * ```
 */
export const acLanguageCode = acNmToken;
/**
 * ```text
 * <!ENTITY % Number "CDATA">
 * ```
 */
export const acNumber: AttributeContent = {
  validateValue(value: string | null, strictness: ActiveStrictness): boolean {
    if (!value || strictness !== Strictness.STRICT) {
      return true;
    }
    return !isNaN(parseInt(value));
  },
};
/**
 * ```text
 * <!ENTITY % URI "CDATA">
 * ```
 */
export const acUri = acCData;
/**
 * ```text
 * <!ENTITY % Text "CDATA">
 * ```
 */
export const acText = acCData;

const lengthRegEx = /^\d+%?$/;
/**
 * ```text
 * <!ENTITY % Length "CDATA">
 * ```
 */
export const acLength: AttributeContent = {
  validateValue(value: string | null, strictness: ActiveStrictness): boolean {
    if (!value || strictness !== Strictness.STRICT) {
      return true;
    }
    return lengthRegEx.test(value);
  },
};

const coreClassAttr = parseAttributeDefinitionConfig({ localName: "class", content: acCData });
/**
 * ```text
 * <!ENTITY % coreattrs
 *   "class       CDATA          #IMPLIED"
 * >
 * ```
 */
export const coreAttrs: ParsedAttributeDefinitionConfig[] = [coreClassAttr];
export const i18nLangAttr = parseAttributeDefinitionConfig({ localName: "lang", content: acLanguageCode });
export const i18nXmlLangAttr = parseAttributeDefinitionConfig({
  localName: "lang",
  prefix: "xml",
  content: acLanguageCode,
});
export const i18nDirAttr = parseAttributeDefinitionConfig({ localName: "dir", content: acEnum("ltr", "rtl") });
/**
 * ```text
 * <!ENTITY % i18n
 *   "lang        %LanguageCode; #IMPLIED
 *    xml:lang    %LanguageCode; #IMPLIED
 *    dir         (ltr|rtl)      #IMPLIED"
 * >
 * ```
 */
export const i18nAttrs: ParsedAttributeDefinitionConfig[] = [i18nLangAttr, i18nXmlLangAttr, i18nDirAttr];
/**
 * ```text
 * <!ENTITY % attrs "%coreattrs; %i18n;">
 * ```
 */
export const commonAttrs: ParsedAttributeDefinitionConfig[] = [...coreAttrs, ...i18nAttrs];

/**
 * ```text
 * <!ENTITY % special "br | span | img">
 * ```
 */
export const special: ElementContent[] = ["br", "span", "img"];
/**
 * ```text
 * <!ENTITY % phrase "em | strong | sub | sup">
 * ```
 */
export const phrase: ElementContent[] = ["em", "strong", "sub", "sup"];
/**
 * ```text
 * <!ENTITY % inline "a | %special; | %phrase;">
 * ```
 */
export const inline: ElementContent[] = ["a", ...special, ...phrase];
/**
 * ```text
 * <!ENTITY % Inline "(#PCDATA | %inline;)*">
 * ```
 */
export const Inline: ElementContent[] = [allowEmpty, pcdata, ...inline];
/**
 * ```text
 * <!ENTITY % lists "ul | ol">
 * ```
 */
export const lists: ElementContent[] = ["ul", "ol"];
/**
 * ```text
 * <!ENTITY % blocktext "pre | blockquote">
 * ```
 */
export const blocktext: ElementContent[] = ["pre", "blockquote"];
/**
 * ```text
 * <!ENTITY % block "p | %lists; | %blocktext; | table">
 * ```
 */
export const block: ElementContent[] = ["p", ...lists, ...blocktext, "table"];
/**
 * ```text
 * <!ENTITY % Block "(%block;)*">
 * ```
 */
export const Block: ElementContent[] = [allowEmpty, ...block];
/**
 * ```text
 * <!ENTITY % Flow "(#PCDATA | %block; | %inline;)*">
 * ```
 */
export const Flow: ElementContent[] = [allowEmpty, pcdata, ...block, ...inline];
/**
 * ```text
 * <!ENTITY % a.content "(#PCDATA | %special; | %phrase;)*">
 * ```
 */
export const aContent: ElementContent[] = [allowEmpty, pcdata, ...special, ...phrase];
/**
 * ```text
 * <!ENTITY % pre.content "(#PCDATA | a | br | span | %phrase;)*">
 * ```
 */
export const preContent: ElementContent[] = [allowEmpty, pcdata, "a", "br", "span", ...phrase];

/**
 * ```text
 * <!ELEMENT div %Block;>
 * <!ATTLIST div
 *   xmlns       %URI;          #FIXED 'http://www.coremedia.com/2003/richtext-1.0'
 *   xmlns:xlink %URI;          #FIXED 'http://www.w3.org/1999/xlink'
 *   >
 * ```
 */
export const divElement = new ElementConfig(Block);
/**
 * ```text
 * <!ELEMENT p %Inline;>
 * <!ATTLIST p
 *   %attrs;
 *   >
 * ```
 */
export const pElement = new ElementConfig(Inline, commonAttrs);
/**
 * ```text
 * <!ELEMENT ul (li)+>
 * <!ATTLIST ul
 *   %attrs;
 *   >
 * ```
 */
export const ulElement = new ElementConfig(["li"], commonAttrs);
/**
 * ```text
 * <!ELEMENT ol (li)+>
 * <!ATTLIST ol
 *   %attrs;
 *   >
 * ```
 */
export const olElement = new ElementConfig(["li"], commonAttrs);
/**
 * ```text
 * <!ELEMENT li %Flow;>
 * <!ATTLIST li
 *   %attrs;
 *   >
 * ```
 */
export const liElement = new ElementConfig(Flow, commonAttrs);
export const preXmlSpaceAttr = parseAttributeDefinitionConfig({
  localName: "space",
  prefix: "xml",
  content: acEnum("preserve"),
  fixed: "preserve",
});
/**
 * ```text
 * <!ELEMENT pre %pre.content;>
 * <!ATTLIST pre
 *   %attrs;
 *   xml:space (preserve) #FIXED 'preserve'
 *   >
 * ```
 */
export const preElement = new ElementConfig(preContent, [...commonAttrs, preXmlSpaceAttr]);
export const blockquoteCiteAttr = parseAttributeDefinitionConfig({
  localName: "cite",
  content: acUri,
});
/**
 * ```text
 * <!ELEMENT blockquote %Block;>
 * <!ATTLIST blockquote
 *   %attrs;
 *   cite        %URI;          #IMPLIED
 *   >
 * ```
 */
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
/**
 * ```text
 * <!ELEMENT a %a.content;>
 * <!ATTLIST a
 *   %attrs;
 *
 *   xlink:type      (simple)        #FIXED "simple"
 *   xlink:href      %URI;           #REQUIRED
 *   xlink:role      CDATA           #IMPLIED
 *   xlink:title     CDATA           #IMPLIED
 *   xlink:show      (new|replace|
 *     embed|other|
 *     none)          #IMPLIED
 *   xlink:actuate   (onRequest|
 *     onLoad)        #IMPLIED
 *   >
 * ```
 */
export const aElement = new ElementConfig(aContent, [...commonAttrs, ...aSpecialAttrs]);
/**
 * ```text
 * <!ELEMENT span %Inline;>
 * <!ATTLIST span
 *   %attrs;
 *   >
 * ```
 */
export const spanElement = new ElementConfig(Inline, commonAttrs);
/**
 * ```text
 * <!ELEMENT br EMPTY>
 * <!ATTLIST br
 *   %coreattrs;
 *   >
 * ```
 */
export const brElement = new ElementConfig([], coreAttrs);
/**
 * ```text
 * <!ELEMENT em %Inline;>
 * <!ATTLIST em %attrs;>
 * ```
 */
export const emElement = new ElementConfig(Inline, commonAttrs);
/**
 * ```text
 * <!ELEMENT strong %Inline;>
 * <!ATTLIST strong %attrs;>
 * ```
 */
export const strongElement = new ElementConfig(Inline, commonAttrs);
/**
 * ```text
 * <!ELEMENT sub %Inline;>
 * <!ATTLIST sub %attrs;>
 * ```
 */
export const subElement = new ElementConfig(Inline, commonAttrs);
/**
 * ```text
 * <!ELEMENT sup %Inline;>
 * <!ATTLIST sup %attrs;>
 * ```
 */
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
/**
 * ```text
 * <!ELEMENT img EMPTY>
 * <!ATTLIST img
 *   %attrs;
 *   alt         %Text;         #REQUIRED
 *   height      %Length;       #IMPLIED
 *   width       %Length;       #IMPLIED
 *
 *   xlink:type      (simple)        #FIXED "simple"
 *   xlink:href      CDATA           #REQUIRED
 *   xlink:role      CDATA           #IMPLIED
 *   xlink:title     CDATA           #IMPLIED
 *   xlink:show      (embed)         #FIXED "embed"
 *   xlink:actuate   (onLoad)        #FIXED "onLoad"
 *
 *   >
 * ```
 */
export const imgElement = new ElementConfig([], [...commonAttrs, ...imgSpecialAttrs]);
/**
 * ```text
 * <!ENTITY % cellhalign "align (left|center|right) #IMPLIED">
 * ```
 */
export const cellHAlignAttr = parseAttributeDefinitionConfig({
  localName: "align",
  content: acEnum("left", "center", "right"),
});
/**
 * ```text
 * <!ENTITY % cellvalign "valign (top|middle|bottom|baseline) #IMPLIED">
 * ```
 */
export const cellVAlignAttr = parseAttributeDefinitionConfig({
  localName: "valign",
  content: acEnum("top", "middle", "bottom", "baseline"),
});
export const tableSummaryAttr = parseAttributeDefinitionConfig({ localName: "summary", content: acText });

/**
 * ```text
 * <!ELEMENT table    (tbody|tr+)>
 * <!ATTLIST table
 *   %attrs;
 *   summary     %Text;         #IMPLIED
 *   >
 * ```
 */
export const tableElement = new ElementConfig(["tbody", "tr"], [...commonAttrs, tableSummaryAttr]);
/**
 * ```text
 * <!ELEMENT tbody    (tr)+>
 * <!ATTLIST tbody
 *   %attrs;
 *   %cellhalign;
 *   %cellvalign;
 *   >
 * ```
 */
export const tbodyElement = new ElementConfig(["tr"], [...commonAttrs, cellHAlignAttr, cellVAlignAttr]);
/**
 * ```text
 * <!ELEMENT tr       (td)+>
 * <!ATTLIST tr
 *   %attrs;
 *   %cellhalign;
 *   %cellvalign;
 *   >
 * ```
 */
export const trElement = new ElementConfig(["td"], [...commonAttrs, cellHAlignAttr, cellVAlignAttr]);
export const tdAbbrAttr = parseAttributeDefinitionConfig({ localName: "abbr", content: acText });
export const tdRowspanAttr = parseAttributeDefinitionConfig({ localName: "rowspan", content: acNumber });
export const tdColspanAttr = parseAttributeDefinitionConfig({ localName: "colspan", content: acNumber });
/**
 * ```text
 * <!ELEMENT td       %Flow;>
 * <!ATTLIST td
 *   %attrs;
 *   abbr        %Text;         #IMPLIED
 *   rowspan     %Number;       "1"
 *   colspan     %Number;       "1"
 *   %cellhalign;
 *   %cellvalign;
 *   >
 * ```
 */
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
export const supportedElements: SupportedRichTextElements = {
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
