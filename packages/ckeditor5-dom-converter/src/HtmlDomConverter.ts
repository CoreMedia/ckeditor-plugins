/**
 * The HTML DOM Converter is dedicated to XML grammars, that are closely related
 * to HTML. Typically, the counterpart offers a subset of elements and
 * attributes compare to HTML.
 *
 * This is an important restriction regarding DOM transformation, as some
 * candy during transformation only comes for HTML elements, such as access to
 * `classList` or `style` attributes. Any `class` attribute of a custom
 * namespace requires to be parsed manually (at least, if it has a
 * namespace prefix).
 */
export class HtmlDomConverter {}
