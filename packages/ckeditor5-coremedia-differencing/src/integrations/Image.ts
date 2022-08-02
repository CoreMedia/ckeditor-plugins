import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { PluginIntegrationHook } from "../PluginIntegrationHook";
import Model from "@ckeditor/ckeditor5-engine/src/model/model";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { XDIFF_ATTRIBUTES } from "../Xdiff";
import { reportInitializationProgress } from "@coremedia/ckeditor5-core-common/Plugins";

/**
 * Hooks into `ImageInline` and `ImageBlock` plugin, if available and
 * registers additional differencing attributes applied to `<img>` elements.
 *
 * For corresponding CSS rules, it is important to understand, that the
 * `xdiff:changetype` attribute is applied to the surrounding element, like
 * the corresponding `<span class="image-inline">` for inline images.
 */
export class ImageElementSupport extends Plugin {
  static readonly pluginName: string = "DifferencingImageElementSupport";
  static readonly requires = [PluginIntegrationHook];

  static readonly #logger: Logger = LoggerProvider.getLogger(ImageElementSupport.pluginName);

  init(): void {
    reportInitializationProgress(ImageElementSupport.pluginName, ImageElementSupport.#logger, () => this.#init());
  }

  #init(): void {
    const { editor } = this;
    const { model, plugins } = editor;
    const { schema }: Model = model;
    const logger = ImageElementSupport.#logger;

    // At least one image plugin should be loaded for the integration to work properly.
    if (!editor.plugins.has("ImageInlineEditing") && !editor.plugins.has("ImageBlockEditing")) {
      logger.debug("Skipping Image Element Integration. Corresponding plugins unavailable.");
      return;
    }

    const pluginIntegrationHook = plugins.get(PluginIntegrationHook);

    logger.debug("Waiting for plugin-integration hook to be ready.");

    pluginIntegrationHook.on("plugin-integration:ready", () => {
      ["imageBlock", "imageInline"].forEach((itemName): void => {
        if (schema.isRegistered(itemName)) {
          logger.debug(`Extending "${itemName}" by difference augmentation attribute.`);
          schema.extend(itemName, {
            allowAttributes: [XDIFF_ATTRIBUTES["xdiff:changetype"]],
          });
        } else {
          logger.debug(`Not integrating with "${itemName}" element, as it is unavailable.`);
        }
      });
    });
  }
}
