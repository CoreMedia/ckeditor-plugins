import { Observable } from "rxjs";

export interface ContentSearchService {
  observe_contentSuggestions(filterValue: string, contentUriPath: string | null): Observable<string[]>;
}
