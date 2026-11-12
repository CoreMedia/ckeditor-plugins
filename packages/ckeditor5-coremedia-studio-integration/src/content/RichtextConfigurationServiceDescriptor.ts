import type { ServiceDescriptorWithProps } from "@coremedia/service-agent";
import { serviceDescriptorFactory } from "@coremedia/service-agent";
import type RichtextConfigurationService from "./RichtextConfigurationService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createRichtextConfigurationServiceDescriptor =
  (): ServiceDescriptorWithProps<RichtextConfigurationService> =>
    serviceDescriptorFactory<RichtextConfigurationService>({
      name: "richtextConfigurationService",
    });
