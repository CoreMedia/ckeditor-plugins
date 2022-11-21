import { isHtmlElement } from "./HtmlElement";

export const isElementCSSInlineStyle = (value: unknown): value is ElementCSSInlineStyle => isHtmlElement(value);
