import { ContentImportService } from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/ContentImportService";
import { createContentReferenceServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/IContentReferenceService";
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

  import(uri: string): Promise<string> {
    const mockExternalContentPlugin = this.#editor.plugins.get(MockExternalContentPlugin);
    const externalContent = mockExternalContentPlugin.getExternalContent(uri);
    if (!externalContent) {
      return Promise.reject();
    }
    const mockContentPlugin = this.#editor.plugins.get(MockContentPlugin);
    mockContentPlugin.addContents(externalContent.contentAfterImport);
    return Promise.resolve(contentUriPath(externalContent.contentAfterImport.id));
  }
}
