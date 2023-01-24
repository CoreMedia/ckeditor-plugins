import { replaceElementByElementAndClass } from "./ReplaceElementByElementAndClass";

/**
 * Fixes naive mapping in old CoreMedia CMS releases, where all `<div>`
 * elements from data view have been mapped to `<p>` in data without applying
 * reverse mapping.
 *
 * Note, that this behavior is backwards compatible, as in CoreMedia
 * Rich Text 1.0 data, before and after these `<div>` elements are stored
 * as `<p>` elements. But in contrast to previous state, these paragraphs
 * are not marked with a reserved class `p--div`, which allows to transparently
 * transform them back to `<div>` when loaded into CKEditor, as well as a
 * corresponding mapping could be applied in delivery.
 *
 * Nevertheless, this mapping is rather limited, as it only supports
 * `<div>` in the same context as `<p>` elements are allowed. The same
 * applies to allowed children. Thus, especially a `<div>` in data view
 * must not contain a nexted `<p>` element. Such states would be fixed by
 * sanitation but may provide surprising results.
 *
 * * **Reserved Class:** `p--div`
 * * **Data View:** `<div>
 * * **Data:** `<p class="p--div">`
 */
export const divElements = replaceElementByElementAndClass({
  viewLocalName: "div",
  dataLocalName: "p",
  dataReservedClass: "p--div",
});
