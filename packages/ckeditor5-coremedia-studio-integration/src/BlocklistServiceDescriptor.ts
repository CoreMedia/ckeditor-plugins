import type { ServiceDescriptorWithProps } from "@coremedia/service-agent";
import { serviceDescriptorFactory } from "@coremedia/service-agent";
import type BlocklistService from "./BlocklistService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createBlocklistServiceDescriptor = (): ServiceDescriptorWithProps<BlocklistService> =>
  serviceDescriptorFactory<BlocklistService>({
    name: "blocklistService",
  });
