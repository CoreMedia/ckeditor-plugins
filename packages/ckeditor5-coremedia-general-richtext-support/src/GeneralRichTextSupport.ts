import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import GeneralHtmlSupport from "@ckeditor/ckeditor5-html-support/src/generalhtmlsupport";
import DataFilter from "@ckeditor/ckeditor5-html-support/src/datafilter";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import ReducedMatcherPattern, { mergePatterns } from "./ReducedMatcherPattern";

class GeneralRichTextSupport extends Plugin {
  static readonly pluginName: string = "GeneralRichTextSupport";
  static readonly #logger: Logger = LoggerProvider.getLogger(GeneralRichTextSupport.pluginName);

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [GeneralHtmlSupport];
  }

  constructor(editor: Editor) {
    super(editor);
  }

  init(): Promise<void> | null {
    const logger = GeneralRichTextSupport.#logger;
    const startTimestamp = performance.now();

    logger.info(`Initializing ${GeneralRichTextSupport.pluginName}...`);

    this.#registerRichTextElements();

    logger.info(`Initialized ${GeneralRichTextSupport.pluginName} within ${performance.now() - startTimestamp} ms.`);

    return null;
  }

  #registerRichTextElements() {
    const logger = GeneralRichTextSupport.#logger;
    const editor = this.editor;
    const dataFilter = editor.plugins.get(DataFilter);
    const config = [
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
    logger.debug("Declared elements and attributes to GHS.", { config });
    dataFilter.loadAllowedConfig(config);
  }
}

/**
 * Represents the CoreMedia RichText 1.0 DTD as required for configuration
 * of General HTML Support feature. It follows a similar structure as the
 * original DTD. Note, that ambiguous attributes like `xml:lang` and `lang`
 * are only handled for one attribute name. Mapping to this one attribute name
 * has to be done in data-processing.
 *
 * **HTML Data Layer Takes the Lead:** It is important to mention, that, while
 * the configuration is based on the subsequent representation of CoreMedia
 * RichText **after** data-processing, which in general is a HTML
 * representation. Example: While CoreMedia RichText does not know about
 * heading elements such as `<h1>`, data-processing will map any
 * `<p class="p--heading-1">` to `<h1>`. That's why `<h1>` has to be part
 * of the General HTML Support Configuration.
 */
class CoreMediaRichText10Dtd {
  static readonly coreattrs: ReducedMatcherPattern = {
    // Any class attribute values are allowed.
    classes: true,
  };
  static readonly i18n: ReducedMatcherPattern = {
    attributes: {
      /**
       * Language Attribute. Alias: xml:lang - needs to be handled in data-processing.
       */
      lang: true,
      /**
       * Direction.
       */
      dir: /^(rtl|ltr)$/,
    },
  };
  static readonly attrs = {
    ...CoreMediaRichText10Dtd.coreattrs,
    ...CoreMediaRichText10Dtd.i18n,
  };
  static attrsBlockElements: MatcherPattern = {
    // h[1-6]: While CoreMedia RichText DTD does not support headings, this is
    // used after toView transformation in data-processor, so that we handle
    // them here, too.
    name: /^(p|ul|ol|li|h[1-6])$/,
    ...CoreMediaRichText10Dtd.attrs,
  };
  static attrsInlineElements: MatcherPattern = {
    // i: While `<i>` is not part of CoreMedia RichText DTD, it is required here
    // because CKEditor uses `<i>` instead of `<em>` in view.
    // See https://github.com/ckeditor/ckeditor5/issues/1394
    // u, del, s, strike: These are part of the HTML representation after
    // data-processing `<span>` with a dedicated class. Thus, they must be
    // handled in the same way as `<span>`.
    // code: Part of HTML representation of data-processed `<span>` with
    // dedicated class. Thus, must be handled in the same way as `<span>`.
    name: /^(span|em|i|strong|sub|sup|u|del|s|strike|code)$/,
    ...CoreMediaRichText10Dtd.attrs,
  };
  static pre: MatcherPattern = {
    name: "pre",
    ...mergePatterns(CoreMediaRichText10Dtd.attrs, {
      attributes: {
        // No need to map to data-attribute, as xml:space is supported in HTML.
        "xml:space": /^(preserve)$/,
      },
    }),
  };
  static blockquote: MatcherPattern = {
    name: "blockquote",
    ...mergePatterns(CoreMediaRichText10Dtd.attrs, {
      attributes: {
        cite: true,
      },
    }),
  };
  static a: MatcherPattern = {
    name: "a",
    ...mergePatterns(CoreMediaRichText10Dtd.attrs, {
      attributes: {
        // Data-Processed by merging xlink:show and xlink:role
        target: true,
        // Data-processed from xlink:title
        title: true,
        // Data-Processed from xlink:actuate
        "data-xlink-actuate": /^(onRequest|onLoad)$/,
        // Data-Processed from xlink:type
        "data-xlink-type": /^(simple)$/,
      },
    }),
  };
  static br: MatcherPattern = {
    name: "br",
    ...CoreMediaRichText10Dtd.coreattrs,
  };
  static img: MatcherPattern = {
    name: "img",
    ...mergePatterns(CoreMediaRichText10Dtd.attrs, {
      attributes: {
        alt: true,
        height: true,
        // Will hold the Blob URL to load for displaying the image.
        // The actual Blob reference is stored in `data-xlink-href`.
        src: true,
        // Data-processed from xlink:title
        title: true,
        width: true,
        // Data-Processed from xlink:actuate
        "data-xlink-actuate": /^(onRequest|onLoad)$/,
        // Data-Processed from xlink:href
        "data-xlink-href": true,
        // Data-Processed from xlink:role
        "data-xlink-role": true,
        // Data-Processed from xlink:show
        "data-xlink-show": /^(embed)$/,
        // Data-Processed from xlink:type
        "data-xlink-type": /^(simple)$/,
      },
    }),
  };
  static table: MatcherPattern = {
    name: "table",
    ...mergePatterns(CoreMediaRichText10Dtd.attrs, {
      attributes: {
        summary: true,
      },
    }),
  };
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
  static tbody: MatcherPattern = {
    name: "tbody",
    ...mergePatterns(
      CoreMediaRichText10Dtd.attrs,
      CoreMediaRichText10Dtd.cellhalign,
      CoreMediaRichText10Dtd.cellvalign
    ),
  };
  static tr: MatcherPattern = {
    name: "tr",
    ...mergePatterns(
      CoreMediaRichText10Dtd.attrs,
      CoreMediaRichText10Dtd.cellhalign,
      CoreMediaRichText10Dtd.cellvalign
    ),
  };
  static td: MatcherPattern = {
    name: "td",
    ...mergePatterns(
      CoreMediaRichText10Dtd.attrs,
      CoreMediaRichText10Dtd.cellhalign,
      CoreMediaRichText10Dtd.cellvalign,
      {
        attributes: {
          abbr: true,
          rowspan: true,
          colspan: true,
        },
      }
    ),
  };
}

export default GeneralRichTextSupport;
export { CoreMediaRichText10Dtd };
