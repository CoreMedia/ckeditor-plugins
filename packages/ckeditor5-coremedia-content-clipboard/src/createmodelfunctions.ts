import { CreateModelFunction, CreateModelFunctionCreator } from "./ContentToModelRegistry";
import { serviceAgent } from "@coremedia/service-agent";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { ROOT_NAME } from "@coremedia/ckeditor5-coremedia-studio-integration/content/Constants";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Node from "@ckeditor/ckeditor5-engine/src/model/node";
import { requireContentCkeModelUri } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import RichtextConfigurationService from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationService";
import RichtextConfigurationServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationServiceDescriptor";

type CreateLinkModelFunction = (contentUri: string, name: string) => CreateModelFunction;
type CreateImageModelFunction = (blobUriPath: string) => CreateModelFunction;

export const createLinkModelFunctionCreator: CreateModelFunctionCreator = async (
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

export const createImageModelFunctionCreator: CreateModelFunctionCreator = async (
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
