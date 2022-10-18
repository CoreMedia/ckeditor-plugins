import { Attributes, Content, p, span, strong } from "./RichTextBase";

/**
 * Convenience to create a `<code>` element in view and model layer.
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const code = (content: Content, attrs: Attributes = {}): string => {
  const classAttr = attrs.class ? `code ${attrs.class}` : `code`;
  const spanAttrs: Attributes = {
    ...attrs,
    class: classAttr,
  };
  return span(content, spanAttrs);
};

/**
 * Convenience to create a heading.
 *
 * **Content:** `(#PCDATA|a|br|span|img|em|strong|sub|sup)*`
 *
 * @param level - level of heading
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const heading = (level: 1 | 2 | 3 | 4 | 5 | 6, content: Content = "", attrs: Attributes = {}): string => {
  const classFromAttrs = attrs.class ? `${attrs.class} ` : ``;
  const classAttribute = `${classFromAttrs}p--heading-${level}`;
  return p(content, {
    ...attrs,
    class: classAttribute,
  });
};

/**
 * Convenience to create a heading of level 1.
 *
 * **Content:** `(#PCDATA|a|br|span|img|em|strong|sub|sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const h1 = (content: Content = "", attrs: Attributes = {}): string => heading(1, content, attrs);

/**
 * Convenience to create a heading of level 2.
 *
 * **Content:** `(#PCDATA|a|br|span|img|em|strong|sub|sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const h2 = (content: Content = "", attrs: Attributes = {}): string => heading(2, content, attrs);

/**
 * Convenience to create a heading of level 3.
 *
 * **Content:** `(#PCDATA|a|br|span|img|em|strong|sub|sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const h3 = (content: Content = "", attrs: Attributes = {}): string => heading(3, content, attrs);

/**
 * Convenience to create a heading of level 4.
 *
 * **Content:** `(#PCDATA|a|br|span|img|em|strong|sub|sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const h4 = (content: Content = "", attrs: Attributes = {}): string => heading(4, content, attrs);

/**
 * Convenience to create a heading of level 6.
 *
 * **Content:** `(#PCDATA|a|br|span|img|em|strong|sub|sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const h5 = (content: Content = "", attrs: Attributes = {}): string => heading(5, content, attrs);

/**
 * Convenience to create a heading of level 8.
 *
 * **Content:** `(#PCDATA|a|br|span|img|em|strong|sub|sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const h6 = (content: Content = "", attrs: Attributes = {}): string => heading(6, content, attrs);

/**
 * Type for all heading factory methods.
 */
export type Headings = typeof h1 | typeof h2 | typeof h3 | typeof h4 | typeof h5 | typeof h6;

/**
 * Type for all block level factory methods with default attributes supporting
 * plain text content.
 */
export type DefaultBlock = typeof p | Headings;

/**
 * Convenience to add some section heading (a paragraph with bold text inside).
 * Attributes apply to paragraph.
 *
 * **Content:** `(#PCDATA|a|br|span|img|em|strong|sub|sup)*`
 *
 * @param content - content to wrap
 * @param attrs - attributes to apply to element
 */
export const sectionHeading = (content: Content = "", attrs: Attributes = {}): string => p(strong(content), attrs);
