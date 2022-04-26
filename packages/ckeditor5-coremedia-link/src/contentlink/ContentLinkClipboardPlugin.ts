import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Node from "@ckeditor/ckeditor5-engine/src/model/node";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { serviceAgent } from "@coremedia/service-agent";
import { ROOT_NAME } from "@coremedia/ckeditor5-coremedia-studio-integration/content/Constants";
import { requireContentCkeModelUri } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

type CreateModelFunction = (writer: Writer) => Node;
type CreateModelFunctionCreator = (contentUri: string) => Promise<CreateModelFunction>;
interface ContentClipboardEditingPlugin extends Plugin {
  registerToModelFunction: (type: string, createModelFunctionCreator: CreateModelFunctionCreator) => void;
}

type CreateLinkModelFunction = (contentUri: string, name: string) => CreateModelFunction;

const createLinkModelFunctionCreator: CreateModelFunctionCreator = async (
  contentUri: string
): Promise<CreateModelFunction> => {
  const contentDisplayService = await serviceAgent.fetchService<ContentDisplayService>(
    new ContentDisplayServiceDescriptor()
  );
  const contentName = await contentDisplayService.name(contentUri);
  return new Promise<CreateModelFunction>((resolve) => resolve(createLinkModelFunction(contentUri, contentName)));
};

const createLinkModelFunction: CreateLinkModelFunction = (contentUri: string, name: string): CreateModelFunction => {
  const nameToPass = name ? name : ROOT_NAME;
  return (writer: Writer): Node => {
    return writer.createText(nameToPass, {
      linkHref: requireContentCkeModelUri(contentUri),
    });
  };
};

export default class ContentLinkClipboardPlugin extends Plugin {
  static readonly pluginName: string = "ContentLinkClipboardPlugin";

  init(): Promise<void> | null {
    const editor = this.editor;
    if (editor.plugins.has("ContentClipboardEditing")) {
      const contentClipboardEditingPlugin: ContentClipboardEditingPlugin = <ContentClipboardEditingPlugin>(
        editor.plugins.get("ContentClipboardEditing")
      );
      contentClipboardEditingPlugin.registerToModelFunction("link", createLinkModelFunctionCreator);
    }

    return null;
  }
}
