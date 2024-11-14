import { Node, Plugin, Writer } from "ckeditor5";
import { createRichtextConfigurationServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { serviceAgent } from "@coremedia/service-agent";
import {
  ContentToModelRegistry,
  CreateModelFunction,
  CreateModelFunctionCreator,
} from "@coremedia/ckeditor5-coremedia-content-clipboard";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";

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

  init(): void {
    const initInformation = reportInitStart(this);
    /**
     const basePlugin = getOptionalPlugin(editor, ContentClipboardEditing, (pluginName) =>
     logger.warn(`Recommended plugin ${pluginName} not found. Creating content images from clipboard not activated.`),
     );
     basePlugin?.registerToModelFunction("image", createImageModelFunctionCreator);
     */
    // as the base plugin {@link ContentClipboardEditing} may be initialized after this plugin, it is necessary to bypass directly to registerToModelFunction
    ContentToModelRegistry.registerToModelFunction("image", createImageModelFunctionCreator);
    reportInitEnd(initInformation);
  }
}
