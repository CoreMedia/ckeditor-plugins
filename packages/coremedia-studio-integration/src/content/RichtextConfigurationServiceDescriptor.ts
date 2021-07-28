import { ServiceDescriptor } from "@coremedia/studio-apps-service-agent/src/ServiceDescriptor";
import RichtextConfigurationService from "./RichtextConfigurationService";

/**
 * Descriptor used to fetch service from service agent.
 */
class RichtextConfigurationServiceDescriptor implements ServiceDescriptor<RichtextConfigurationService> {
  constructor() {
    this.name = "richtextConfigurationService";
  }

  name: string;
}

export default RichtextConfigurationServiceDescriptor;
