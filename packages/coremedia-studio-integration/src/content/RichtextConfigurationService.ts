import { ServiceObject } from "@coremedia/studio-apps-service-agent";
import { Observable } from "rxjs";
import { UriPath } from "./UriPath";

interface RichtextConfigurationService extends ServiceObject {
  observe_hasLinkableType(uripath: UriPath): Observable<boolean>;
  observe_isEmbeddableType(uripath: UriPath): Observable<boolean>;
}

export default RichtextConfigurationService;
