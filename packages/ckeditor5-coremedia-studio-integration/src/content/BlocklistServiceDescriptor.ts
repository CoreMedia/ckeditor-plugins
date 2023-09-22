import { serviceDescriptorFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";
import BlocklistService from "./BlocklistService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createBlocklistServiceDescriptor = (): ServiceDescriptorWithProps<BlocklistService> =>
  serviceDescriptorFactory<BlocklistService>({
    name: "blocklistService",
  });
