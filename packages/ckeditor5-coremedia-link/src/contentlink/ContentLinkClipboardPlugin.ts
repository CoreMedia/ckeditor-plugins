import { Plugin, Writer, Node } from "ckeditor5";
import { createContentDisplayServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/ContentDisplayServiceDescriptor";
import { serviceAgent } from "@coremedia/service-agent";
import { ROOT_NAME } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/Constants";
import { requireContentCkeModelUri } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/UriPath";
import Logger from "@coremedia/ckeditor5-logging/src/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import {
  CreateModelFunction,
  CreateModelFunctionCreator,
} from "@coremedia/ckeditor5-coremedia-content-clipboard/src/ContentToModelRegistry";
import ContentClipboardEditing from "@coremedia/ckeditor5-coremedia-content-clipboard/src/ContentClipboardEditing";
import { getOptionalPlugin, reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";
type CreateLinkModelFunction = (contentUri: string, name: string) => CreateModelFunction;
const createLinkModelFunctionCreator: CreateModelFunctionCreator = async (
  contentUri: string,
): Promise<CreateModelFunction> => {
  const contentDisplayService = await serviceAgent.fetchService(createContentDisplayServiceDescriptor());
  const contentName = await contentDisplayService.name(contentUri);
  return createLinkModelFunction(contentUri, contentName);
};
const createLinkModelFunction: CreateLinkModelFunction = (contentUri: string, name: string): CreateModelFunction => {
  const nameToPass = name ? name : ROOT_NAME;
  return (writer: Writer): Node =>
    writer.createText(nameToPass, {
      linkHref: requireContentCkeModelUri(contentUri),
    });
};

/**
 * This plugin registers a "toModel" function for the ContentClipboardEditing
 * plugin.
 *
 * Initially, the ContentClipboardEditing plugin does not know how to handle
 * insertions (e.g., via drag and drop) of contents into the editor. Therefore,
 * each feature has to provide this information to the plugin manually.
 *
 * This particular plugin provides a strategy on how to insert contents that
 * should be displayed as a link.
 */
export default class ContentLinkClipboardPlugin extends Plugin {
  public static readonly pluginName = "ContentLinkClipboardPlugin" as const;
  static readonly #logger: Logger = LoggerProvider.getLogger(ContentLinkClipboardPlugin.pluginName);
  init(): void {
    const logger = ContentLinkClipboardPlugin.#logger;
    const { editor } = this;
    const initInformation = reportInitStart(this);
    getOptionalPlugin(editor, ContentClipboardEditing, (pluginName) =>
      logger.warn(`Recommended plugin ${pluginName} not found. Creating content links from clipboard not activated.`),
    )?.registerToModelFunction("link", createLinkModelFunctionCreator);
    reportInitEnd(initInformation);
  }
}
