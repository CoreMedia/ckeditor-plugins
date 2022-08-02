import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { ImageElementSupport } from "./integrations/Image";
import { HtmlImageElementSupport } from "./integrations/HtmlSupportImage";
import { XDIFF_ATTRIBUTES, XDIFF_SPAN_ELEMENT_CONFIG } from "./Xdiff";
import { reportInitializationProgress } from "@coremedia/ckeditor5-core-common/Plugins";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

/**
 * Plugin, which adds support for server-side data augmentation for
 * showing differences in data. This plugin is meant to be used in
 * read-only CKEditors that receive data from the server, which got augmented
 * by differencing hints.
 */
export class Differencing extends Plugin {
  static readonly pluginName: string = "Differencing";
  static readonly requires = [HtmlImageElementSupport, ImageElementSupport];

  static readonly #logger: Logger = LoggerProvider.getLogger(Differencing.pluginName);

  init(): void {
    reportInitializationProgress(Differencing.pluginName, Differencing.#logger, () => this.#init());
  }

  #init(): void {
    const editor = this.editor;
    const { model, conversion } = editor;
    const { schema } = model;

    Differencing.#logger.info("Huhu?!??");

    schema.register("xdiff-span", {
      allowIn: ["$block", "$container"],
      allowChildren: ["$text", "$block", "$container"],
      allowAttributes: Object.values(XDIFF_ATTRIBUTES),
      isInline: true,
    });

    conversion.for("upcast").elementToElement(XDIFF_SPAN_ELEMENT_CONFIG);
    // dataDowncast: We also downcast back to data view, relying on other mechanisms
    // (like data-processing), that these changes are not written back to the
    // server, as these don't represent "real" data but augmented data, which are
    // not meant to be stored on server again.
    conversion.for("downcast").elementToElement(XDIFF_SPAN_ELEMENT_CONFIG);

    Object.entries(XDIFF_ATTRIBUTES).forEach(([view, model]) => {
      const config = { view, model };
      conversion.for("upcast").attributeToAttribute(config);
      conversion.for("downcast").attributeToAttribute(config);
    });
  }
}
