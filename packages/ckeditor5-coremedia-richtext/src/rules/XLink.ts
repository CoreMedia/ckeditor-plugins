import { preserveAttributeAs } from "@coremedia/ckeditor5-dataprocessor-support/Attributes";

/**
 * Transforms `xlink:actuate` to Data View representation `data-xlink-actuate` and
 * vice versa.
 */
const xLinkActuateMapper = preserveAttributeAs("xlink:actuate", "data-xlink-actuate");

/**
 * Transforms `xlink:href` to `data-xlink-href`. Note, that this should only
 * be used in scenarios, where the corresponding HTML element in data view
 * does not provide an attribute to handle the `xlink:href` value.
 *
 * **Example where to use this mapper:** For the `<img>` element, we cannot
 * directly map `xlink:href` to a corresponding `src` attribute. Instead, the
 * `src` attribute will refer to some URL to download the Blob data from, while
 * we need `data-xlink-href` to store the reference to a given content and a
 * given Blob property.
 *
 * **Example where not to use this mapper:** For the `<a>` element, we are able
 * to map the value of `xlink:href` to the `href` attribute in data view.
 * There is no need, to store and maintain the original reference at some
 * other place. Thus, we would not use this mapper in this case.
 */
const xLinkHrefMapper = preserveAttributeAs("xlink:href", "data-xlink-href");

/**
 * Transforms `xlink:role` to `data-xlink-role`. Note, that this should only
 * be used in scenarios, where there corresponding HTML element in data view
 * does not provide an attribute to handle the `xlink:role` value.
 *
 * **Example where to use this mapper:** For the `<img>` element, we cannot
 * directly map `xlink:role` to any other attribute. As for images `xlink:show`
 * is fixed to `embed` according to CoreMedia RichText DTD 1.0, this attribute
 * is pretty meaningless. Thus, in custom implementations, `xlink:role` may
 * be used to store for example ARIA information. If this is true, you should
 * replace the mapping to the corresponding attribute.
 *
 * **Example where not to use this mapper:** For the `<a>` element, we decided
 * to map the `xlink:role` along with the `xlink:show` attribute to some
 * `target`. Thus, for anchor elements, there is no need using this mapper, as
 * the information is stored elsewhere.
 */
const xLinkRoleMapper = preserveAttributeAs("xlink:role", "data-xlink-role");

/**
 * Transforms `xlink:show` to `data-xlink-show`. Note, that this should only
 * be used in scenarios, where there corresponding HTML element in data view
 * does not provide an attribute to handle the `xlink:show` value.
 *
 * **Example where to use this mapper:** For the `<img>` element, we cannot
 * directly map `xlink:show` to any other attribute. Note, though, that for
 * CoreMedia RichText 1.0 DTD the value of `xlink:show` is fixed to `embed`.
 * Thus, we only store the attribute for consistency in data view.
 *
 * **Example where not to use this mapper:** For the `<a>` element, we decided
 * to map the `xlink:show` along with the `xlink:role` attribute to some
 * `target`. Thus, for anchor elements, there is no need using this mapper, as
 * the information is stored elsewhere.
 */
const xLinkShowMapper = preserveAttributeAs("xlink:show", "data-xlink-show");

/**
 * Transforms `xlink:title` to Data View representation `title` and
 * vice versa. Expects, that the relevant elements have a valid HTML attribute
 * `title` (such as `<a>` and `<img>`.
 */
const xLinkTitleMapper = preserveAttributeAs("xlink:title", "title");

/**
 * Transforms `xlink:type` to Data View representation `data-xlink-type` and
 * vice versa.
 */
const xLinkTypeMapper = preserveAttributeAs("xlink:type", "data-xlink-type");

export { xLinkActuateMapper, xLinkHrefMapper, xLinkRoleMapper, xLinkShowMapper, xLinkTitleMapper, xLinkTypeMapper };
