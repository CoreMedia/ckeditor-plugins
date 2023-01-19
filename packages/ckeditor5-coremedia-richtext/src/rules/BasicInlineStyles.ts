import { replaceElementByElement } from "./ReplaceElementByElement";
import {
  replaceElementByElementAndClass,
  ReplaceElementByElementAndClassConfig,
} from "./ReplaceElementByElementAndClass";

/**
 * Failsafe approach. CKEditor 5 uses <strong> by default, thus no need to
 * remap. Nevertheless, plugins may add `<b>` as valid element again.
 */
export const legacyBoldSupport = replaceElementByElement({
  viewLocalName: "b",
  dataLocalName: "strong",
  direction: "toData",
});

/**
 * Applies bijective mapping for underline element.
 *
 * ```xml
 * <span class="underline">Lorem</span>
 * ```
 *
 * to
 *
 * ```html
 * <u>Lorem</u>
 * ```
 *
 * and vice versa.
 */
export const underlines = replaceElementByElementAndClass({
  viewLocalName: "u",
  dataLocalName: "span",
  dataReservedClass: "underline",
});

/**
 * Applies bijective mapping for italic element.
 *
 * ```xml
 * <em>Lorem</em>
 * ```
 *
 * to
 *
 * ```html
 * <i>Lorem</i>
 * ```
 *
 * and vice versa.
 */
// DevNote: May need to be adapted, if https://github.com/ckeditor/ckeditor5/issues/1394.
// is resolved.
export const italics = replaceElementByElement({ viewLocalName: "i", dataLocalName: "em" });

/**
 * Preferred bijective mapping for strikethrough element.
 *
 * ```xml
 * <span class="strike">Lorem</span>
 * ```
 *
 * to
 *
 * ```html
 * <s>Lorem</s>
 * ```
 *
 * and vice versa.
 */
const preferredStrikeConfig: ReplaceElementByElementAndClassConfig = {
  viewLocalName: "s",
  dataLocalName: "span",
  dataReservedClass: "strike",
};
/**
 * Support for possibly legacy strikethrough elements, that may have been
 * configured. Mappings only ensure transformation on `toData` processing.
 */
const legacyStrikeMappings = ["del", "strike"].map((viewLocalName) =>
  replaceElementByElementAndClass({
    ...preferredStrikeConfig,
    viewLocalName,
    direction: "toData",
  })
);

/**
 * Rules for supporting mapping of various strikethrough elements, with
 * preference for
 * ```xml
 * <span class="strike">Lorem</span>
 * ```
 *
 * to
 *
 * ```html
 * <s>Lorem</s>
 * ```
 *
 * and vice versa.
 */
export const strikethroughs = [replaceElementByElementAndClass(preferredStrikeConfig), ...legacyStrikeMappings];

/**
 * Rules for basic inline styles mapped to CoreMedia Rich Text 1.0:
 *
 * * `<i>` and `<em>`
 * * `<b>` (`<strong>` preferred in data view)
 * * `<s>` (also with legacy support for `<del>` and `<strike>`).
 */
export const basicInlineStyles = [italics, legacyBoldSupport, ...strikethroughs, underlines];
