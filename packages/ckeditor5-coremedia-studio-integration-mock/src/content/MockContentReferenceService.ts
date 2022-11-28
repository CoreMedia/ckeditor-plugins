import {
  ContentReferenceRequest,
  ContentReferenceResponse,
  ContentReferenceService,
  createContentReferenceServiceDescriptor,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/ContentReferenceService";
import { Editor } from "@ckeditor/ckeditor5-core";
import MockExternalContentPlugin from "./MockExternalContentPlugin";
import MockContentPlugin from "./MockContentPlugin";
import { isUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

export class MockContentReferenceService implements ContentReferenceService {
  #editor: Editor;

  constructor(editor: Editor) {
    this.#editor = editor;
  }

  getName(): string {
    return createContentReferenceServiceDescriptor().name;
  }

  getContentReferences(requests: ContentReferenceRequest[]): Promise<ContentReferenceResponse[]> {
    return Promise.all(requests.map((request) => this.getContentReference(request)));
  }

  getContentReference(request: ContentReferenceRequest): Promise<ContentReferenceResponse> {
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
    request: ContentReferenceRequest
  ): ContentReferenceResponse | undefined {
    if (!request.uri) {
      return undefined;
    }

    const contentExist = mockContentPlugin.hasExplicitContent(request.uri);
    if (contentExist || isUriPath(request.uri)) {
      return {
        request,
        content: { uri: request.uri, uuid: "Some UUID" },
        contentReferenceInformation: {
          isContent: true,
          isKnownUriPattern: true,
        },
      };
    }

    const externalContentExist = mockExternalContentPlugin.externalContentExist(request.uri);
    if (externalContentExist) {
      return {
        request,
        content: undefined,
        contentReferenceInformation: {
          isContent: false,
          isKnownUriPattern: true,
        },
      };
    }

    return {
      request,
      content: undefined,
      contentReferenceInformation: {
        isContent: false,
        isKnownUriPattern: false,
      },
    };
  }
}
