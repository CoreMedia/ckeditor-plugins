import { ServiceObject } from "@coremedia/studio-apps-service-agent";
import { UriPath } from "./UriPath";

interface RichtextConfigurationService extends ServiceObject {
  hasLinkableType(uripath: UriPath): Promise<boolean>;
  isEmbeddableType(uripath: UriPath): Promise<boolean>;
}

export default RichtextConfigurationService;
