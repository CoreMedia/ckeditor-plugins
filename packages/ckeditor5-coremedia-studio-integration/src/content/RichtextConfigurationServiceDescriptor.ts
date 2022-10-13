import { serviceDescFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";
import RichtextConfigurationService from "./RichtextConfigurationService";

/**
 * Descriptor used to fetch service from service agent.
 */
export function createRichtextConfigurationServiceDescriptor(): ServiceDescriptorWithProps<RichtextConfigurationService> {
  return serviceDescFactory<RichtextConfigurationService>({
    name: "richtextConfigurationService",
  });
}
