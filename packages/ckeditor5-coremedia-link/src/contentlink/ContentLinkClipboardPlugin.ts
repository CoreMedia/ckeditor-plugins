import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Node from "@ckeditor/ckeditor5-engine/src/model/node";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { serviceAgent } from "@coremedia/service-agent";
import { ROOT_NAME } from "@coremedia/ckeditor5-coremedia-studio-integration/content/Constants";
import { requireContentCkeModelUri } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import {
  CreateModelFunction,
  CreateModelFunctionCreator,
} from "@coremedia/ckeditor5-coremedia-content-clipboard/ContentToModelRegistry";
import ContentClipboardEditing from "@coremedia/ckeditor5-coremedia-content-clipboard/ContentClipboardEditing";
import { ifPlugin, recommendPlugin } from "@coremedia/ckeditor5-common/Plugins";

type CreateLinkModelFunction = (contentUri: string, name: string) => CreateModelFunction;

const createLinkModelFunctionCreator: CreateModelFunctionCreator = async (
  contentUri: string
): Promise<CreateModelFunction> => {
  const contentDisplayService = await serviceAgent.fetchService<ContentDisplayService>(
    new ContentDisplayServiceDescriptor()
  );
  const contentName = await contentDisplayService.name(contentUri);
  return createLinkModelFunction(contentUri, contentName);
};

const createLinkModelFunction: CreateLinkModelFunction = (contentUri: string, name: string): CreateModelFunction => {
  const nameToPass = name ? name : ROOT_NAME;
  return (writer: Writer): Node => {
    return writer.createText(nameToPass, {
      linkHref: requireContentCkeModelUri(contentUri),
    });
  };
};

/**
 * This plugin registers a "toModel" function for the ContentClipboardEditing plugin.
 * Initially, the ContentClipboardEditing plugin does not know how to handle insertions (e.g. via drag and drop)
 * of contents into the editor. Therefore, each feature has to provide this information to the plugin manually.
 *
 * This particular plugin provides a strategy on how to insert contents that should be displayed as a link.
 */
export default class ContentLinkClipboardPlugin extends Plugin {
  static readonly pluginName: string = "ContentLinkClipboardPlugin";
  static readonly #logger: Logger = LoggerProvider.getLogger(ContentLinkClipboardPlugin.pluginName);

  async init(): Promise<void> {
    const pluginName = ContentLinkClipboardPlugin.pluginName;
    const logger = ContentLinkClipboardPlugin.#logger;
    const startTimestamp = performance.now();

    logger.debug(`Initializing ${pluginName}...`);

    const { editor } = this;

    await ifPlugin(editor, ContentClipboardEditing)
      .then((plugin) => {
        plugin.registerToModelFunction("link", createLinkModelFunctionCreator);
      })
      .catch(recommendPlugin("Creating Content Links from Clipboard not activated.", logger));

    logger.debug(`Initialized ${pluginName} within ${performance.now() - startTimestamp} ms.`);
  }
}
