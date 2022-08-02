import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { PluginIntegrationHook } from "../PluginIntegrationHook";
import Model from "@ckeditor/ckeditor5-engine/src/model/model";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

/**
 * Hooks into `ImageInline` and `ImageBlock` plugin, if available and
 * registered additional differencing attributes applied to `<img>` elements.
 */
export class ImageElementSupport extends Plugin {
  static readonly pluginName: string = "DifferencingImageElementSupport";
  static readonly requires = [PluginIntegrationHook];

  static readonly #logger: Logger = LoggerProvider.getLogger(ImageElementSupport.pluginName);

  init(): void {
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
      if (schema.isRegistered("imageBlock")) {
        logger.debug(`Extending "imageBlock" by difference augmentation attribute.`);
        schema.extend("imageBlock", {
          allowAttributes: ["changeType"],
        });
      } else {
        logger.debug(`Not integrating with "imageBlock" element, as it is unavailable.`);
      }

      if (schema.isRegistered("imageInline")) {
        logger.debug(`Extending "imageInline" by difference augmentation attribute.`);
        schema.extend("imageInline", {
          allowAttributes: ["changeType"],
        });
      } else {
        logger.debug(`Not integrating with "imageBlock" element, as it is unavailable.`);
      }
    });
  }
}
