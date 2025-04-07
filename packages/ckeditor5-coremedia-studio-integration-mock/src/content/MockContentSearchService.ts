import { ContentSearchService } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { defaultMockContentProvider, MockContentProvider } from "./MockContentPlugin";
import { Observable, of } from "rxjs";

const uriPaths: string[] = [];
for (let i = 0; i < 100; i++) {
  uriPaths.push(`content:10${i}`);
}

export class MockContentSearchService implements ContentSearchService {
  readonly #contentProvider: MockContentProvider;

  /**
   * Constructor with some configuration options for the mock service.
   */
  constructor(contentProvider: MockContentProvider = defaultMockContentProvider) {
    this.#contentProvider = contentProvider;
  }

  getName(): string {
    return "contentSearchService";
  }

  observe_contentSuggestions(filterValue: string): Observable<string[]> {
    return of(filterValue.length < 3 ? uriPaths.slice(0, 5) : uriPaths.filter((uriPath) => uriPath.match(filterValue)));
  }
}
