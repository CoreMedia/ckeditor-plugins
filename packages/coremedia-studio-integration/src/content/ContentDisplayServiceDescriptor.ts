import { ServiceDescriptor } from "@coremedia/studio-apps-service-agent/src/ServiceDescriptor";
import ContentDisplayService from "./ContentDisplayService";

/**
 * Descriptor used to fetch service from service agent.
 */
class ContentDisplayServiceDescriptor implements ServiceDescriptor<ContentDisplayService> {
  constructor() {
    this.name = "contentDisplayService";
  }

  name: string;
}

export default ContentDisplayServiceDescriptor;
