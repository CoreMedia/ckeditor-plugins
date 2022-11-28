import { ContentImportService } from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/ContentImportService";
import {
  ContentReference,
  createContentReferenceServiceDescriptor,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/ContentReferenceService";
import { Editor } from "@ckeditor/ckeditor5-core";
import MockContentPlugin from "./MockContentPlugin";
import MockExternalContentPlugin from "./MockExternalContentPlugin";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

export class MockContentImportService implements ContentImportService {
  readonly #editor: Editor;

  constructor(editor: Editor) {
    this.#editor = editor;
  }

  getName(): string {
    return createContentReferenceServiceDescriptor().name;
  }

  import(uri: string): Promise<ContentReference> {
    const mockExternalContentPlugin = this.#editor.plugins.get(MockExternalContentPlugin);
    const externalContent = mockExternalContentPlugin.getExternalContent(uri);
    if (!externalContent) {
      return Promise.reject();
    }
    const mockContentPlugin = this.#editor.plugins.get(MockContentPlugin);
    mockContentPlugin.addContents(externalContent.contentAfterImport);
    return Promise.resolve({ uri: contentUriPath(externalContent.contentAfterImport.id), uuid: "Some UUID" });
  }
}
