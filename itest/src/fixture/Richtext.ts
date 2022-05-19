/**
 * Example Usage:
 * ```
 * const text = richtext([
 *   p("This is an introduction."),
 *   ul([
 *     li("Simple List Item"),
 *     li(p("List Item with Paragraph")),
 *     li("List Item with class", { class: "some--class" }),
 *   ]),
 * ]);
 * ```
 * @packageDocumentation
 */
// noinspection HttpUrlsUsage
export const defaultNamespaceUri = "http://www.coremedia.com/2003/richtext-1.0";
export const xlinkNamespace = {
  attr: "xmlns:xlink",
  prefix: "xlink:",
  uri: "http://www.w3.org/1999/xlink",
};
export const defaultXmlDeclaration = `<?xml version="1.0" encoding="utf-8"?>`;

/**
 * Default attributes to possibly apply to the root `<div>` of CoreMedia
 * Richtext.
 */
export const defaultRichtextAttributes = {
  xmlns: defaultNamespaceUri,
  [xlinkNamespace.attr]: xlinkNamespace.uri,
};

/**
 * URI.
 */
export type Uri = string;
/**
 * Language codes such as `en-US`.
 */
export type LanguageCode = string;
/**
 * Any text.
 */
export type Text = string;
/**
 * Any length.
 */
export type Length = number;
/**
 * Character data.
 */
export type CDATA = string;
/**
 * Direction attribute values for i18n.
 */
export type Direction = "ltr" | "rtl";

/**
 * Represents just any attributes.
 */
export type AnyAttributes = { [key: string]: unknown };

/**
 * `coreattrs` attributes according to DTD.
 */
export interface CoreAttributes {
  class?: CDATA;
}

/**
 * `i18n` attributes according to DTD.
 */
export interface InternationalizationAttributions {
  lang?: LanguageCode;
  "xml:lang"?: LanguageCode;
  dir?: Direction;
}

/**
 * Refers to `attrs` in DTD.
 */
export interface Attributes extends CoreAttributes, InternationalizationAttributions {}

/**
 * Transforms a set of attributes to `key="value"` pairs joined by space
 * character, so that it can be written as element attributes.
 *
 * @param attrs - attributes to join
 * @param keyFilter - optional filter to possibly remove some attributes; defaults to answer `true`, which is to add all attributes
 */
export const joinAttributes = (attrs: AnyAttributes, keyFilter: (k: string) => boolean = () => true): string => {
  return Object.entries(attrs)
    .filter(([k]) => {
      return keyFilter(k);
    })
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
};

/**
 * We may provide contents as single string or as array of strings.
 * An array of strings will be joined without separator (thus, attached
 * to each other).
 */
export type Content = string | string[];

/**
 * Validates, that content must not be empty.
 * @param content - content to validate
 */
export const nonEmptyContent = (content: Content): Content => {
  const merged = "".concat(...content);
  if (merged.length === 0) {
    throw new Error("Content must not be empty.");
  }
  return content;
};

/**
 * Support for any non-empty element.
 *
 * @param element - non-empty element to create
 * @param content - content to wrap by element
 * @param attrs - attributes to apply to element
 */
export const nonEmptyElement = (element: string, content: Content = "", attrs: string | AnyAttributes = ""): string => {
  const elemAttrs = typeof attrs === "string" ? attrs : joinAttributes(attrs);
  const joinedContent = Array.isArray(content) ? content.join("") : content;
  return `<${element}${elemAttrs ? ` ${elemAttrs}` : ""}>${joinedContent}</${element}>`;
};

/**
 * Support for any empty element.
 *
 * @param element - non-empty element to create
 * @param attrs - attributes to apply to element
 */
export const emptyElement = (element: string, attrs: string | AnyAttributes = ""): string => {
  const elemAttrs = typeof attrs === "string" ? attrs : joinAttributes(attrs);
  return `<${element}${elemAttrs ? ` ${elemAttrs}` : ""}/>`;
};

/**
 * Wraps given richtext into required `<div>` with XML declaration header.
 *
 * **Content:** `(p|ol|ul|pre|blockquote|table)*`
 *
 * @param content - content to wrap
 * @param xmlDeclaration - XML declaration, which defaults to
 * `<?xml version="1.0" encoding="utf-8"?>`; the richtext `<div>` will be
 * directly appended without any additional whitespace
 */
export const richtext = (content: Content = "", xmlDeclaration = defaultXmlDeclaration): string => {
  const hasXLink = content.includes(xlinkNamespace.prefix);
  const attrs = joinAttributes(defaultRichtextAttributes, (k) => k !== xlinkNamespace.attr || hasXLink);
  return `${xmlDeclaration}${nonEmptyElement("div", content, attrs)}`;
};

/**
 * Wraps given content into `<p>` with given attributes.
 *
 * **Content:** `(#PCDATA|a|br|span|img|em|strong|sub|sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const p = (content: Content = "", attrs: Attributes = {}): string => {
  return nonEmptyElement("p", content, { ...attrs });
};

/**
 * Wraps given content into `<ul>` with given attributes.
 *
 * **Content:** `(li)+`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const ul = (content: Content, attrs: Attributes = {}): string => {
  return nonEmptyElement("ul", nonEmptyContent(content), { ...attrs });
};

/**
 * Wraps given content into `<ol>` with given attributes.
 *
 * **Content:** `(li)+`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const ol = (content: Content, attrs: Attributes = {}): string => {
  return nonEmptyElement("ol", nonEmptyContent(content), { ...attrs });
};

/**
 * Wraps given content into `<li>` with given attributes.
 *
 * **Content:** `(#PCDATA | p | ul | ol | pre | blockquote | table | a | br | span | img | em | strong | sub | sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const li = (content: Content = "", attrs: Attributes = {}): string => {
  return nonEmptyElement("li", content, { ...attrs });
};

/**
 * Attributes applicable to `<pre>`.
 */
export interface PreAttributes extends Attributes {
  "xml:space"?: "preserve";
}

/**
 * Wraps given content into `<pre>` with given attributes.
 *
 * **Content:** `(#PCDATA | a | br | span | em | strong | sub | sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const pre = (content: Content = "", attrs: PreAttributes = {}): string => {
  return nonEmptyElement("pre", content, { ...attrs });
};

/**
 * Attributes applicable to `<blockquote>`.
 */
export interface BlockquoteAttributes extends Attributes {
  cite?: Uri;
}

/**
 * Wraps given content into `<blockquote>` with given attributes.
 *
 * **Content:** `(p | ul | ol | pre | blockquote | table)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const blockquote = (content: Content = "", attrs: BlockquoteAttributes = {}): string => {
  return nonEmptyElement("pre", content, { ...attrs });
};

/**
 * Attributes applicable to `<a>`.
 */
export interface AnchorAttributes extends Attributes {
  "xlink:type"?: "simple";
  "xlink:href": Uri;
  "xlink:role"?: CDATA;
  "xlink:title"?: CDATA;
  "xlink:show"?: "new" | "replace" | "embed" | "other" | "none";
  "xlink:actuate"?: "onRequest" | "onLoad";
}

/**
 * Wraps given content into `<a>` with given attributes.
 *
 * **Content:** `(#PCDATA | br | span | img | em | strong | sub | sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const a = (content: Content = "", attrs: AnchorAttributes): string => {
  return nonEmptyElement("a", content, { ...attrs });
};

/**
 * Wraps given content into `<span>` with given attributes.
 *
 * **Content:** `(#PCDATA | a | br | span | img | em | strong | sub | sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const span = (content: Content = "", attrs: Attributes = {}): string => {
  return nonEmptyElement("span", content, { ...attrs });
};

/**
 * Adds element `<br>` with given attributes.
 *
 * @param attrs - attributes to apply to element
 */
export const br = (attrs: CoreAttributes = {}): string => {
  return emptyElement("br", { ...attrs });
};

/**
 * Wraps given content into `<em>` with given attributes.
 *
 * **Content:** `(#PCDATA | a | br | span | img | em | strong | sub | sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const em = (content: Content = "", attrs: Attributes = {}): string => {
  return nonEmptyElement("em", content, { ...attrs });
};

/**
 * Wraps given content into `<strong>` with given attributes.
 *
 * **Content:** `(#PCDATA | a | br | span | img | em | strong | sub | sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const strong = (content: Content = "", attrs: Attributes = {}): string => {
  return nonEmptyElement("strong", content, { ...attrs });
};

/**
 * Wraps given content into `<sub>` with given attributes.
 *
 * **Content:** `(#PCDATA | a | br | span | img | em | strong | sub | sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const sub = (content: Content = "", attrs: Attributes = {}): string => {
  return nonEmptyElement("sub", content, { ...attrs });
};

/**
 * Wraps given content into `<sup>` with given attributes.
 *
 * **Content:** `(#PCDATA | a | br | span | img | em | strong | sub | sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const sup = (content: Content = "", attrs: Attributes = {}): string => {
  return nonEmptyElement("sup", content, { ...attrs });
};

/**
 * Attributes applicable to `<img>`.
 */
export interface ImageAttributes extends Attributes {
  alt: Text;
  height?: Length;
  width?: Length;
  "xlink:type"?: "simple";
  "xlink:href": Uri;
  "xlink:role"?: CDATA;
  "xlink:title"?: CDATA;
  "xlink:show"?: "embed";
  "xlink:actuate"?: "onLoad";
}

/**
 * Adds element `<img>` with given attributes.
 *
 * @param attrs - attributes to apply to element
 */
export const img = (attrs: ImageAttributes): string => {
  return emptyElement("img", { ...attrs });
};

/**
 * Horizontal Alignment Attribute.
 */
export interface CellHAlign {
  align?: "left" | "center" | "right";
}

/**
 * Vertical Alignment Attribute.
 */
export interface CellVAlign {
  valign?: "top" | "middle" | "bottom" | "baseline";
}

/**
 * Attributes applicable to `<table>`.
 */
export interface TableAttributes extends Attributes {
  summary?: Text;
}

/**
 * Wraps given content into `<table>` with given attributes.
 *
 * **Content:** `(tbody|tr+)`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const table = (content: Content, attrs: TableAttributes = {}) => {
  return nonEmptyElement("table", nonEmptyContent(content), { ...attrs });
};

/**
 * Attributes applicable to `<tbody>`.
 */
export interface TableBodyAttributes extends Attributes, CellHAlign, CellVAlign {}

/**
 * Wraps given content into `<tbody>` with given attributes.
 *
 * **Content:** `(tr)+`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const tbody = (content: Content, attrs: TableBodyAttributes = {}) => {
  return nonEmptyElement("tbody", nonEmptyContent(content), { ...attrs });
};

/**
 * Attributes applicable to `<tr>`.
 */
export interface TableRowAttributes extends Attributes, CellHAlign, CellVAlign {}

/**
 * Wraps given content into `<tr>` with given attributes.
 *
 * **Content:** `(td)+`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const tr = (content: Content, attrs: TableRowAttributes = {}) => {
  return nonEmptyElement("tr", nonEmptyContent(content), { ...attrs });
};

/**
 * Attributes applicable to `<td>`.
 */
export interface TableDataAttributes extends Attributes, CellHAlign, CellVAlign {
  abbr?: Text;
  rowspan?: number;
  colspan?: number;
}

/**
 * Wraps given content into `<td>` with given attributes.
 *
 * **Content:** `(td)+`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const td = (content: Content, attrs: TableDataAttributes = {}) => {
  return nonEmptyElement("td", nonEmptyContent(content), { ...attrs });
};
