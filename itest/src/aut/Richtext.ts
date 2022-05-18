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
 * Support for any non-empty element.
 *
 * @param element - non-empty element to create
 * @param content - content to wrap by element
 * @param attrs - attributes to apply to element
 */
export const nonEmptyElement = (element: string, content = "", attrs: string | AnyAttributes = ""): string => {
  const elemAttrs = typeof attrs === "string" ? attrs : joinAttributes(attrs);
  return `<${element}${elemAttrs ? ` ${elemAttrs}` : ""}>${content}</${element}>`;
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
export const richtext = (content = "", xmlDeclaration = defaultXmlDeclaration): string => {
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
export const p = (content = "", attrs: Attributes = {}): string => {
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
export const ul = (content: string, attrs: Attributes = {}): string => {
  return nonEmptyElement("ul", content, { ...attrs });
};

/**
 * Wraps given content into `<ol>` with given attributes.
 *
 * **Content:** `(li)+`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const ol = (content: string, attrs: Attributes = {}): string => {
  return nonEmptyElement("ol", content, { ...attrs });
};

/**
 * Wraps given content into `<li>` with given attributes.
 *
 * **Content:** `(#PCDATA | p | ul | ol | pre | blockquote | table | a | br | span | img | em | strong | sub | sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const li = (content = "", attrs: Attributes = {}): string => {
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
export const pre = (content = "", attrs: PreAttributes = {}): string => {
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
export const blockquote = (content = "", attrs: BlockquoteAttributes = {}): string => {
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
export const a = (content: string, attrs: AnchorAttributes): string => {
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
export const span = (content = "", attrs: Attributes = {}): string => {
  return nonEmptyElement("span", content, { ...attrs });
};

/**
 * Adds element `<br>` with given attributes.
 *
 * @param attrs - attributes to apply to element
 */
export const br = (attrs: CoreAttributes = {}): string => {
  return emptyElement("span", { ...attrs });
};

/**
 * Wraps given content into `<em>` with given attributes.
 *
 * **Content:** `(#PCDATA | a | br | span | img | em | strong | sub | sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const em = (content = "", attrs: Attributes = {}): string => {
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
export const strong = (content = "", attrs: Attributes = {}): string => {
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
export const sub = (content = "", attrs: Attributes = {}): string => {
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
export const sup = (content = "", attrs: Attributes = {}): string => {
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

/*
 * TODO: Add Tables
 */
