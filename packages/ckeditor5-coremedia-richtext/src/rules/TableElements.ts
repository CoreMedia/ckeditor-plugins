import { replaceElementByElementAndClass } from "./ReplaceElementByElementAndClass";
import { mergeTableSectionsToTableBody } from "./MergeTableSectionsToTableBody";
import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/Rule";

/**
 * Applies bijective mapping for table header cells element.
 *
 * ```xml
 * <td class="td--header">Lorem</td>
 * ```
 *
 * to
 *
 * ```html
 * <th>Lorem</th>
 * ```
 *
 * and vice versa.
 */
export const tableHeaderElements = replaceElementByElementAndClass({
  viewLocalName: "th",
  dataLocalName: "td",
  dataReservedClass: "td--header",
});

/**
 * Adds support for table sections `<thead>` and `<tfoot>`.
 *
 * Applies bijective mapping such as:
 *
 * ```xml
 * <table>
 *   <tbody>
 *     <tr class="tr--header"/>
 *     <tr/>
 *     <tr class="tr--footer"/>
 *   </tbody>
 * </table>
 * ```
 *
 * to
 *
 * ```html
 * <table>
 *   <thead><tr/></thead>
 *   <tbody><tr/></tbody>
 *   <tfoot><tr/></tfoot>
 * </table>
 * ```
 *
 * and vice versa.
 *
 * Note that some limitations apply:
 *
 * * **Attribute Handling:**
 *
 *   As there is no representation as element for `<thead>` and `<tfoot>` in
 *   CoreMedia Rich Text 1.0, their attributes and those of `<tbody>` need to
 *   be dealt with. Decision for now is, that it is expected, that all share
 *   the same attributes. Thus, on `toData` processing all attributes are
 *   merged into `<tbody>` element, while on `toView` processing all resulting
 *   table sections will share the same attributes afterwards.
 *
 *   This behavior may be changed with corresponding rules with higher
 *   priority.
 *
 *   Similar to that, attributes of multiple `<tbody>` sections are merged.
 *
 * * **`<tfoot>` unsupported in CKEditor 5, yet:**
 *
 *   As of writing, `<tfoot>` is not supported by CKEditor 5. This may be
 *   changed by custom plugins or more recent CKEditor 5 versions. Still,
 *   a corresponding mapping exists and with General HTML Support enabled,
 *   limited `<tfoot>` support should be available also while editing.
 *
 * * **Multiple `<tbody>` sections unsupported in CKEditor 5, yet:**
 *
 *   As of writing, multiple `<tbody>` sections are not supported in CKEditor 5.
 *   Still, corresponding mapping exists, to at least do not lose the
 *   corresponding data, once such a feature ships with CKEditor 5 or is
 *   provided via custom plugin.
 *
 *   Note though, that this mapping is not yet bijective: Multiple `<tbody>`
 *   sections are merged into one on `toData` processing and cannot be restored
 *   later. If this is required, you may want to store the corresponding
 *   body index in an artificial class attribute value, like `tr--body-1` and
 *   `tr--body-2` similar to the solution provided for `<thead>` and `<tfoot>`.
 */
export const tableSectionsSupport = mergeTableSectionsToTableBody();

/**
 * Mapping for table elements.
 */
export const tableElements: RuleConfig[] = [tableHeaderElements, tableSectionsSupport];
