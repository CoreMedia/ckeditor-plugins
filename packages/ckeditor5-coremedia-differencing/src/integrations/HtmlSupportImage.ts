import { Plugin } from "ckeditor5";
import { XDIFF_ATTRIBUTES } from "../Xdiff";
import { Logger, LoggerProvider } from "@coremedia/ckeditor5-logging";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";

/**
 * Hooks into GHS' `DataSchema` plugin, if available and registers additional
 * differencing attributes applied to `<img>` elements.
 *
 * For corresponding CSS rules, it is important to understand, that the
 * `xdiff:changetype` attribute is applied to the surrounding element, i.e.,
 * the corresponding `<span class="html-object-embed">` element.
 */
export class HtmlImageElementSupport extends Plugin {
  static readonly pluginName = "DifferencingHtmlImageElementSupport";
  static readonly requires = [];
  static readonly #logger: Logger = LoggerProvider.getLogger("DifferencingHtmlImageElementSupport");

  init(): void {
    const initInformation = reportInitStart(this);
    this.#init();
    reportInitEnd(initInformation);
  }

  #init(): void {
    const { editor } = this;
    const { model } = editor;
    const { schema } = model;
    const logger = HtmlImageElementSupport.#logger;
    if (editor.plugins.has("ImageInlineEditing") || editor.plugins.has("ImageBlockEditing")) {
      logger.debug(`Skipping initialization, as corresponding "real" image plugins are available.`);
      return;
    }
    if (!editor.plugins.has("DataSchema")) {
      logger.debug(`Skipping initialization, as GHS' DataSchema plugin is unavailable.`);
      return;
    }
    logger.debug(`Registering "checkAttribute" schema handler to allow "xdiff:changetype" on "htmlImg".`);

    /*
     * As GHS registers `htmlImg` late in CKEditor's initialization process,
     * there does not seem to be a good/robust way to extend `htmlImg` element.
     * That is why we instead listen to `checkAttribute` to handle this case
     * on demand. This is a workaround for
     * [ckeditor/ckeditor5#12199](https://github.com/ckeditor/ckeditor5/issues/12199).
     */
    schema.on(
      "checkAttribute",
      (evt, args: [string, string]) => {
        const context = args[0];
        const attributeName = args[1];
        if (context.endsWith("htmlImg") && attributeName === XDIFF_ATTRIBUTES["xdiff:changetype"]) {
          // Prevent next listeners from being called.
          evt.stop();
          // Set the checkAttribute()'s return value.
          evt.return = true;
        }
      },
      {
        priority: "high",
      },
    );
  }
}
