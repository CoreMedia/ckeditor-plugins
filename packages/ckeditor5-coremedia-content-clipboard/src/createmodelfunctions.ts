import { CreateModelFunction, CreateModelFunctionCreator } from "./ContentToModelRegistry";
import { serviceAgent } from "@coremedia/service-agent";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { ROOT_NAME } from "@coremedia/ckeditor5-coremedia-studio-integration/content/Constants";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Node from "@ckeditor/ckeditor5-engine/src/model/node";
import { requireContentCkeModelUri } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

type CreateLinkModelFunction = (contentUri: string, name: string) => CreateModelFunction;

export const createLinkModelFunctionCreator: CreateModelFunctionCreator = (
  contentUri: string
): Promise<CreateModelFunction> => {
  return serviceAgent
    .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
    .then((contentDisplayService: ContentDisplayService): Promise<string> => {
      return contentDisplayService.name(contentUri);
    })
    .then((name: string): Promise<CreateModelFunction> => {
      return new Promise<CreateModelFunction>((resolve) => {
        resolve(createLinkModelFunction(contentUri, name));
      });
    });
};

const createLinkModelFunction: CreateLinkModelFunction = (contentUri: string, name: string): CreateModelFunction => {
  const nameToPass = name ? name : ROOT_NAME;
  return (writer: Writer): Node => {
    return writer.createText(nameToPass, {
      linkHref: requireContentCkeModelUri(contentUri),
    });
  };
};
