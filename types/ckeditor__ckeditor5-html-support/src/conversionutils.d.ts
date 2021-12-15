import DowncastWriter from "@ckeditor/ckeditor5-engine/src/view/downcastwriter";
import Element from "@ckeditor/ckeditor5-engine/src/view/element";

/**
 * Helper function for downcast converter. Sets attributes on the given view element.
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @param {Object} viewAttributes
 * @param {module:engine/view/element~Element} viewElement
 */

export function setViewAttributes(writer: DowncastWriter, viewAttributes: Object, viewElement: Element): void;

/**
 * Merges view element attribute objects.
 *
 * @param {Object} target
 * @param {Object} source
 * @returns {Object}
 */
export function mergeViewElementAttributes(target: Object, source: Object): Object;
