import { preserveAttributeAs } from "@coremedia/ckeditor5-dataprocessor-support/Attributes";

/**
 * Transforms `xlink:type` to Data View representation `data-xlink-type` and
 * vice versa.
 */
const xLinkTypeMapper = preserveAttributeAs("xlink:type", "data-xlink-type");
/**
 * Transforms `xlink:actuate` to Data View representation `data-xlink-actuate` and
 * vice versa.
 */
const xLinkActuateMapper = preserveAttributeAs("xlink:actuate", "data-xlink-actuate");
/**
 * Transforms `xlink:title` to Data View representation `title` and
 * vice versa. Expects, that the relevant elements have a valid HTML attribute
 * `title` (such as `<a>` and `<img>`.
 */
const xLinkTitleMapper = preserveAttributeAs("xlink:title", "title");

export { xLinkTypeMapper, xLinkActuateMapper, xLinkTitleMapper };
