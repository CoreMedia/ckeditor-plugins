import {
  ContentReferenceResponse,
  createContentReferenceServiceDescriptor,
  IContentReferenceService,
} from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/studioservices/IContentReferenceService";
import { Editor } from "@ckeditor/ckeditor5-core";
import MockExternalContentPlugin from "./MockExternalContentPlugin";
import MockContentPlugin from "./MockContentPlugin";
import { isUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/UriPath";

export class MockContentReferenceService implements IContentReferenceService {
  #editor: Editor;

  constructor(editor: Editor) {
    this.#editor = editor;
  }

  getName(): string {
    return createContentReferenceServiceDescriptor().name;
  }

  getContentReferences(requests: string[]): Promise<ContentReferenceResponse[]> {
    return Promise.all(requests.map((request) => this.getContentReference(request)));
  }

  getContentReference(request: string): Promise<ContentReferenceResponse> {
    const mockContentPlugin: MockContentPlugin = this.#editor.plugins.get(
      MockContentPlugin.pluginName
    ) as MockContentPlugin;
    const mockExternalContentPlugin: MockExternalContentPlugin = this.#editor.plugins.get(
      MockExternalContentPlugin.pluginName
    ) as MockExternalContentPlugin;
    const response = this.#evaluateResponse(mockContentPlugin, mockExternalContentPlugin, request);
    return response ? Promise.resolve(response) : Promise.reject();
  }

  #evaluateResponse(
    mockContentPlugin: MockContentPlugin,
    mockExternalContentPlugin: MockExternalContentPlugin,
    request: string
  ): ContentReferenceResponse | undefined {
    if (!request) {
      return undefined;
    }

    const externalContent = mockExternalContentPlugin.getExternalContent(request);
    if (externalContent) {
      if (externalContent.isAlreadyImported && externalContent.contentAfterImport) {
        if (externalContent.contentAfterImport.type) {
          return {
            request,
            contentUri: undefined,
            externalUriInformation: {
              contentUri: `content/${externalContent.contentAfterImport.id}`,
              mappedContentType: externalContent.contentAfterImport.type,
            },
          };
        }
      }

      if (externalContent.contentAfterImport?.type) {
        return {
          request,
          contentUri: undefined,
          externalUriInformation: {
            contentUri: undefined,
            mappedContentType: externalContent.contentAfterImport.type,
          },
        };
      }
    }

    const contentExist = mockContentPlugin.hasExplicitContent(request);
    if (contentExist || isUriPath(request)) {
      return {
        request,
        contentUri: request,
        externalUriInformation: undefined,
      };
    }

    return {
      request,
      contentUri: undefined,
      externalUriInformation: undefined,
    };
  }
}
