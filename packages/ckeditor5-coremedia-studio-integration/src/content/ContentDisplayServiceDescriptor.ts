import { ServiceDescriptor } from "@coremedia/service-agent";
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
