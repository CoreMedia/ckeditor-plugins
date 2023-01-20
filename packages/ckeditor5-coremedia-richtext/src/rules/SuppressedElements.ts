import { replaceByChildren } from "./ReplaceByChildren";

/**
 * CKEditor surrounds tables, for example, by `<figure>` elements. We want to
 * remove them to ensure, that we get no complaints on sanitation.
 */
export const suppressedFigure = replaceByChildren({ localName: "figure" });

export const suppressedElements = [suppressedFigure];
