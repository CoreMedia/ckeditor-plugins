import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Node from "@ckeditor/ckeditor5-engine/src/model/node";
import RichtextConfigurationService from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationService";
import RichtextConfigurationServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationServiceDescriptor";
import { serviceAgent } from "@coremedia/service-agent";

type CreateModelFunction = (writer: Writer) => Node;
type CreateModelFunctionCreator = (contentUri: string) => Promise<CreateModelFunction>;
interface ContentClipboardEditingPlugin extends Plugin {
  registerToModelFunction: (type: string, createModelFunctionCreator: CreateModelFunctionCreator) => void;
}

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

export default class ContentImageClipboardPlugin extends Plugin {
  static readonly pluginName: string = "ContentImageClipboardPlugin";

  init(): Promise<void> | null {
    const editor = this.editor;
    if (editor.plugins.has("ContentClipboardEditing")) {
      const contentClipboardEditingPlugin: ContentClipboardEditingPlugin = <ContentClipboardEditingPlugin>(
        editor.plugins.get("ContentClipboardEditing")
      );
      contentClipboardEditingPlugin.registerToModelFunction("image", createImageModelFunctionCreator);
    }

    return null;
  }
}
