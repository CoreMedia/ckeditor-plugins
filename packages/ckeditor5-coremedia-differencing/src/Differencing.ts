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
 *
 * To use this plugin the plugin has to be part of the CKEditor configuration and
 * it has to be activated programmatically by calling Differencing.activateDifferencing
 * after the editor initialization.
 *
 * @example
 * ```typescript
 * ClassicEditor.create(document.querySelector('.editor'), {
 *   .
 *   .
 *   .
 *   plugins: [
 *     Differencing,
 *   ],
 *   .
 *   .
 *   .
 * }).then(newEditor => {
 *   const differencing = newEditor.plugins.get("Differencing");
 *   if (differencing) {
 *     differencing.activateDifferencing();
 *   }
 * })
 * ```
 */
export class Differencing extends Plugin {
  static readonly pluginName: string = "Differencing";
  static readonly requires = [HtmlImageElementSupport, ImageElementSupport];

  static readonly #logger: Logger = LoggerProvider.getLogger(Differencing.pluginName);

  /**
   * Provides information about the current activation state. Once activated it
   * can not be deactivated. Activation can not be executed twice.
   */
  #isActivated = false;

  /**
   * Activates the differencing.
   */
  activateDifferencing(): void {
    if (this.#isActivated) {
      return;
    }
    reportInitializationProgress(Differencing.pluginName, Differencing.#logger, () => this.#init());
    this.#isActivated = true;
  }

  #init(): void {
    const editor = this.editor;
    const { model, conversion } = editor;
    const { schema } = model;

    schema.register("xdiff-span", {
      allowIn: ["$block", "$container"],
      allowChildren: ["$text", "$block", "$container"],
      allowAttributes: Object.values(XDIFF_ATTRIBUTES),
      isInline: true,
    });

    conversion.for("upcast").elementToElement(XDIFF_SPAN_ELEMENT_CONFIG);
    /*
     * **dataDowncast:** We also downcast back to data view, relying on other
     * mechanisms (like data-processing), that these changes are not written
     * back to the server, as these don't represent "real" data but augmented
     * data, which are not meant to be stored on server again.
     */

    conversion.for("downcast").elementToElement({
      ...XDIFF_SPAN_ELEMENT_CONFIG,
      view: (modelElement, { writer }) => {
        if (modelElement.childCount === 0) {
          /*
           * Especially for CSS rules to apply, it is important to keep the
           * empty state here. Not explicitly stating, that this element
           * is considered empty, would add a filler element inside, like:
           *
           * ```html
           * <br data-cke-filler="true">
           * ```
           *
           * which again is hard to apply CSS styles to.
           */
          return writer.createEmptyElement(XDIFF_SPAN_ELEMENT_CONFIG.view);
        }
        return writer.createContainerElement(XDIFF_SPAN_ELEMENT_CONFIG.view);
      },
    });

    /*
     * **Note on data-processing:** Regarding dataDowncast we rely on any
     * "unknown attribute" to be removed automatically. This applies especially
     * (only?) to `xdiff:changetype` applied to `<img>` elements. That is why we
     * do not require extra clean-up on toData-processing.
     */
    Object.entries(XDIFF_ATTRIBUTES).forEach(([view, model]) => {
      const config = { view, model };
      conversion.for("upcast").attributeToAttribute(config);
      conversion.for("downcast").attributeToAttribute(config);
    });
  }
}
