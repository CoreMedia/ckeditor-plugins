import { Observable } from "rxjs";

interface ContentSearchService {
  observe_contentSuggestions(filterValue: string, contentUriPath: string | null): Observable<string[]>;
}

export default ContentSearchService;
