import {
  ContentImportService,
  createContentReferenceServiceDescriptor,
  contentUriPath,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import { Editor } from "ckeditor5";
import MockContentPlugin from "./MockContentPlugin";
import MockExternalContentPlugin from "./MockExternalContentPlugin";

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
      return Promise.reject(
        new Error("No external content found, has it been defined in the MockExternalContentPlugin?"),
      );
    }
    if (!externalContent.contentAfterImport) {
      return Promise.reject(new Error("A content that would have been created has not been provided."));
    }
    if (externalContent.errorWhileImporting) {
      return Promise.reject(new Error("An error occurred and is hopefully handled"));
    }
    const mockContentPlugin = this.#editor.plugins.get(MockContentPlugin);
    mockContentPlugin.addContents(externalContent.contentAfterImport);
    return Promise.resolve(contentUriPath(externalContent.contentAfterImport.id));
  }
}
