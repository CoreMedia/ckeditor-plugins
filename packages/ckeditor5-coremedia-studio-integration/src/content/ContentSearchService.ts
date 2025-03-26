import { Observable } from "rxjs";

interface ContentSearchService {
  observe_contentSuggestions(filterValue: string): Observable<string[]>;
}

export default ContentSearchService;
