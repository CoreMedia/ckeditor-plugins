import { CreateModelFunction, CreateModelFunctionCreator } from "./ContentToModelRegistry";
import { serviceAgent } from "@coremedia/service-agent";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { ROOT_NAME } from "@coremedia/ckeditor5-coremedia-studio-integration/content/Constants";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Node from "@ckeditor/ckeditor5-engine/src/model/node";
import { requireContentCkeModelUri } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

type CreateLinkModelFunction = (contentUri: string, name: string) => CreateModelFunction;

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
