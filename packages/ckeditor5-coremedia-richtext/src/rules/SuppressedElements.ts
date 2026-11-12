import { replaceByChildren } from "./ReplaceByChildren";

/**
 * CKEditor surrounds tables, for example, by `<figure>` elements. We want to
 * remove them to ensure that we get no complaints on sanitation.
 *
 * Note that this approach ignores any properties possibly set at a figure.
 * To deal with these elements, you either have to apply some early processing
 * or remove this rule.
 *
 * @example For table from data view
 * ```html
 * <figure class="table"><table><tbody><tr><td>&nbsp;</td></tr></tbody></table></figure>
 * ```
 */
export const suppressedFigure = replaceByChildren({ localName: "figure", direction: "toData" });

/**
 * Rules for removing elements; we want to ignore in data. While this is
 * also done as part of sanitation for _unknown CoreMedia Rich Text 1.0
 * elements_, these extra rules are meant to prevent possible warnings
 * triggered during the sanitation process.
 */
export const suppressedElements = [suppressedFigure];
