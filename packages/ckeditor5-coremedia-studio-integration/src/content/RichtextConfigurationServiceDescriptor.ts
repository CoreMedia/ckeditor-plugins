import { serviceDescFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";
import RichtextConfigurationService from "./RichtextConfigurationService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createRichtextConfigurationServiceDescriptor =
  (): ServiceDescriptorWithProps<RichtextConfigurationService> =>
    serviceDescFactory<RichtextConfigurationService>({
      name: "richtextConfigurationService",
    });
