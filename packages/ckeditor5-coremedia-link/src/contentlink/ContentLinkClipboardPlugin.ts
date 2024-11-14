import { Node, Plugin, Writer } from "ckeditor5";
import {
  createContentDisplayServiceDescriptor,
  requireContentCkeModelUri,
  ROOT_NAME,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import { serviceAgent } from "@coremedia/service-agent";
import {
  CreateModelFunction,
  CreateModelFunctionCreator,
  ContentToModelRegistry,
} from "@coremedia/ckeditor5-coremedia-content-clipboard";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";

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

  init(): void {
    const initInformation = reportInitStart(this);
    /**
     const basePlugin = getOptionalPlugin(editor, ContentClipboardEditing, (pluginName) =>
     logger.warn(`Recommended plugin ${pluginName} not found. Creating content links from clipboard not activated.`),
     );
     console.log("basePlugin", basePlugin);
     basePlugin?.registerToModelFunction("link", createLinkModelFunctionCreator);
     */
    // as the base plugin {@link ContentClipboardEditing} may be initialized after this plugin, it is necessary to bypass directly to registerToModelFunction
    ContentToModelRegistry.registerToModelFunction("link", createLinkModelFunctionCreator);
    reportInitEnd(initInformation);
  }
}
