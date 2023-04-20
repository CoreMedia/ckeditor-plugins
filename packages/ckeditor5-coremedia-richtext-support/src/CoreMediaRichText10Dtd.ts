import ReducedMatcherPattern, { mergePatterns } from "./ReducedMatcherPattern";

/**
 * Represents the CoreMedia RichText 1.0 DTD as required for configuration
 * of General HTML Support feature. It follows a similar structure as the
 * original DTD. Note that ambiguous attributes like `xml:lang` and `lang`
 * are only handled for one attribute name. Mapping to this one attribute name
 * has to be done in data-processing.
 *
 * **HTML Data Layer Takes the Lead:** It is important to mention that, while
 * the configuration is based on the subsequent representation of CoreMedia
 * RichText **after** data-processing, which in general is an HTML
 * representation.
 *
 * **Example:** To store the attribute `xlink:actuate` unknown to HTML, we
 * expect it to be mapped to `data-xlink-actuate` for HTML. That is why
 * the configuration adds the known attribute `data-xlink-actuate` for
 * element `<a>`, for example.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class CoreMediaRichText10Dtd {
  static readonly coreattrs: ReducedMatcherPattern = {
    // Any class attribute values are allowed.
    classes: true,
  };
  static readonly i18n: ReducedMatcherPattern = {
    attributes: {
      /**
       * Language Attribute. Alias: xml:lang — needs to be handled in data-processing.
       */
      lang: true,
      /**
       * Direction.
       */
      dir: /^(rtl|ltr)$/,
    },
  };
  static readonly attrs: ReducedMatcherPattern = mergePatterns(
    CoreMediaRichText10Dtd.coreattrs,
    CoreMediaRichText10Dtd.i18n
  );
  static attrsBlockElements: ReducedMatcherPattern = mergePatterns(
    { name: /^(p|ul|ol|li)$/ },
    CoreMediaRichText10Dtd.attrs
  );
  static attrsInlineElements: ReducedMatcherPattern = mergePatterns(
    { name: /^(span|em|strong|sub|sup)$/ },
    CoreMediaRichText10Dtd.attrs
  );
  static pre: ReducedMatcherPattern = mergePatterns(
    {
      name: "pre",
      attributes: {
        // No need to map to data-attribute, as xml:space is supported in HTML.
        "xml:space": /^(preserve)$/,
      },
    },
    CoreMediaRichText10Dtd.attrs
  );
  static blockquote: ReducedMatcherPattern = mergePatterns(
    {
      name: "blockquote",
      attributes: {
        cite: true,
      },
    },
    CoreMediaRichText10Dtd.attrs
  );
  static a: ReducedMatcherPattern = mergePatterns(
    {
      name: "a",
      attributes: {
        // href is the data-processed result of xlink:href
        "href": true,
        // Data-Processed by merging xlink:show and xlink:role
        "target": true,
        // Data-processed from xlink:title
        "title": true,
        // Data-Processed from xlink:actuate
        "data-xlink-actuate": /^(onRequest|onLoad)$/,
        // Data-Processed from xlink:type
        "data-xlink-type": /^(simple)$/,
      },
    },
    CoreMediaRichText10Dtd.attrs
  );
  static br: ReducedMatcherPattern = mergePatterns({ name: "br" }, CoreMediaRichText10Dtd.coreattrs);
  static img: ReducedMatcherPattern = mergePatterns(
    {
      name: "img",
      attributes: {
        "alt": true,
        "height": true,
        // Will hold the Blob URL to load for displaying the image.
        // The actual Blob reference is stored in `data-xlink-href`.
        "src": true,
        "width": true,
        // Data-Processed from xlink:actuate
        "data-xlink-actuate": /^(onRequest|onLoad)$/,
        // Data-Processed from xlink:href
        "data-xlink-href": true,
        // Data-Processed from xlink:role
        "data-xlink-role": true,
        // Data-Processed from xlink:show
        "data-xlink-show": /^(embed)$/,
        // Data-processed from xlink:title
        "data-xlink-title": true,
        // Data-Processed from xlink:type
        "data-xlink-type": /^(simple)$/,
      },
    },
    CoreMediaRichText10Dtd.attrs
  );
  static table: ReducedMatcherPattern = mergePatterns(
    {
      name: "table",
      attributes: {
        summary: true,
      },
    },
    CoreMediaRichText10Dtd.attrs
  );
  static cellhalign: ReducedMatcherPattern = {
    attributes: {
      align: /^(left|center|right)$/,
    },
  };
  static cellvalign: ReducedMatcherPattern = {
    attributes: {
      valign: /^(top|middle|bottom|baseline)$/,
    },
  };
  static tbody: ReducedMatcherPattern = mergePatterns(
    { name: "tbody" },
    CoreMediaRichText10Dtd.attrs,
    CoreMediaRichText10Dtd.cellhalign,
    CoreMediaRichText10Dtd.cellvalign
  );
  static tr: ReducedMatcherPattern = mergePatterns(
    { name: "tr" },
    CoreMediaRichText10Dtd.attrs,
    CoreMediaRichText10Dtd.cellhalign,
    CoreMediaRichText10Dtd.cellvalign
  );
  static td: ReducedMatcherPattern = mergePatterns(
    {
      name: "td",
      attributes: {
        abbr: true,
        rowspan: true,
        colspan: true,
      },
    },
    CoreMediaRichText10Dtd.attrs,
    CoreMediaRichText10Dtd.cellhalign,
    CoreMediaRichText10Dtd.cellvalign
  );
}

/**
 * Represents CoreMedia RichText 1.0 as the configuration suitable for
 * configuring General HTML Support.
 */
const COREMEDIA_RICHTEXT_1_0_CONFIG = [
  CoreMediaRichText10Dtd.attrsBlockElements,
  CoreMediaRichText10Dtd.attrsInlineElements,
  CoreMediaRichText10Dtd.pre,
  CoreMediaRichText10Dtd.blockquote,
  CoreMediaRichText10Dtd.a,
  CoreMediaRichText10Dtd.br,
  CoreMediaRichText10Dtd.img,
  CoreMediaRichText10Dtd.table,
  CoreMediaRichText10Dtd.tbody,
  CoreMediaRichText10Dtd.tr,
  CoreMediaRichText10Dtd.td,
];

export default CoreMediaRichText10Dtd;
export { COREMEDIA_RICHTEXT_1_0_CONFIG };
