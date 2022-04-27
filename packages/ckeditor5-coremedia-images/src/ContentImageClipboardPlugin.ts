import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Node from "@ckeditor/ckeditor5-engine/src/model/node";
import RichtextConfigurationService from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationService";
import RichtextConfigurationServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationServiceDescriptor";
import { serviceAgent } from "@coremedia/service-agent";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import {
  CreateModelFunction,
  CreateModelFunctionCreator,
} from "@coremedia/ckeditor5-coremedia-content-clipboard/ContentToModelRegistry";
import ContentClipboardEditing from "@coremedia/ckeditor5-coremedia-content-clipboard/ContentClipboardEditing";

type CreateImageModelFunction = (blobUriPath: string) => CreateModelFunction;

const createImageModelFunctionCreator: CreateModelFunctionCreator = async (
  contentUri: string
): Promise<CreateModelFunction> => {
  const configurationService = await serviceAgent.fetchService<RichtextConfigurationService>(
    new RichtextConfigurationServiceDescriptor()
  );
  const blobUriPath = await configurationService.resolveBlobPropertyReference(contentUri);
  return new Promise<CreateModelFunction>((resolve) => resolve(createImageModelFunction(blobUriPath)));
};

const createImageModelFunction: CreateImageModelFunction = (blobUriPath: string): CreateModelFunction => {
  return (writer: Writer): Node => {
    return writer.createElement("imageInline", {
      "xlink-href": blobUriPath,
    });
  };
};

/**
 * This plugin registers a "toModel" function for the ContentClipboardEditing plugin.
 * Initially, the ContentClipboardEditing plugin does not know how to handle insertions (e.g. via drag and drop)
 * of contents into the editor. Therefore, each feature has to provide this information to the plugin manually.
 *
 * This particular plugin provides a strategy on how to insert contents that should be displayed as a preview image.
 */
export default class ContentImageClipboardPlugin extends Plugin {
  static readonly pluginName: string = "ContentImageClipboardPlugin";
  static readonly #logger: Logger = LoggerProvider.getLogger(ContentImageClipboardPlugin.pluginName);

  init(): Promise<void> | null {
    const pluginName = ContentImageClipboardPlugin.pluginName;
    const contentClipboardEditingName = ContentClipboardEditing.pluginName;
    const logger = ContentImageClipboardPlugin.#logger;
    const startTimestamp = performance.now();

    logger.info(`Initializing ${pluginName}...`);

    const editor = this.editor;
    if (editor.plugins.has(ContentClipboardEditing)) {
      const contentClipboardEditingPlugin: ContentClipboardEditing = editor.plugins.get(ContentClipboardEditing);
      contentClipboardEditingPlugin.registerToModelFunction("image", createImageModelFunctionCreator);
    } else {
      logger.info(
        `Recommended plugin ${contentClipboardEditingName} missing. Creating Content Images from Clipboard not activated.`
      );
    }

    logger.info(`Initialized ${pluginName} within ${performance.now() - startTimestamp} ms.`);

    return null;
  }
}
