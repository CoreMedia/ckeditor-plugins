import RichtextConfigurationService from "@coremedia/coremedia-studio-integration/src/content/RichtextConfigurationService";
import { Observable } from "rxjs";

class MockRichtextConfigurationService implements RichtextConfigurationService {
  observe_hasLinkableType(uripath: string): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      return subscriber.next(true);
    });
  }

  observe_isEmbeddableType(uripath: string): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      return subscriber.next(true);
    });
  }

  getName(): string {
    return "mockRichtextConfigurationService";
  }
}
export default MockRichtextConfigurationService;
