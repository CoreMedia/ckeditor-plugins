import { Node, Plugin, Writer } from "ckeditor5";
import { createRichtextConfigurationServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { serviceAgent } from "@coremedia/service-agent";
import { Logger, LoggerProvider } from "@coremedia/ckeditor5-logging";
import {
  ContentClipboardEditing,
  CreateModelFunction,
  CreateModelFunctionCreator,
} from "@coremedia/ckeditor5-coremedia-content-clipboard";
import { getOptionalPlugin, reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";

type CreateImageModelFunction = (blobUriPath: string) => CreateModelFunction;
const createImageModelFunctionCreator: CreateModelFunctionCreator = async (
  contentUri: string,
): Promise<CreateModelFunction> => {
  const configurationService = await serviceAgent.fetchService(createRichtextConfigurationServiceDescriptor());
  const blobUriPath = await configurationService.resolveBlobPropertyReference(contentUri);
  return createImageModelFunction(blobUriPath);
};
const createImageModelFunction: CreateImageModelFunction =
  (blobUriPath: string): CreateModelFunction =>
  (writer: Writer): Node =>
    writer.createElement("imageInline", {
      "xlink-href": blobUriPath,
    });

/**
 * This plugin registers a `toModel` function for the `ContentClipboardEditing`
 * plugin.
 *
 * Initially, the `ContentClipboardEditing` plugin does not know how to handle
 * insertions (e.g., via drag and drop) of contents into the editor. Therefore,
 * each feature has to provide this information to the plugin manually.
 *
 * This particular plugin provides a strategy on how to insert contents that
 * should be displayed as a preview image.
 */
export default class ContentImageClipboardPlugin extends Plugin {
  static readonly pluginName = "ContentImageClipboardPlugin" as const;
  static readonly #logger: Logger = LoggerProvider.getLogger(ContentImageClipboardPlugin.pluginName);

  init(): void {
    const logger = ContentImageClipboardPlugin.#logger;
    const { editor } = this;

    const initInformation = reportInitStart(this);

    getOptionalPlugin(editor, ContentClipboardEditing, (pluginName) =>
      logger.warn(`Recommended plugin ${pluginName} not found. Creating content images from clipboard not activated.`),
    )?.registerToModelFunction("image", createImageModelFunctionCreator);

    reportInitEnd(initInformation);
  }
}
