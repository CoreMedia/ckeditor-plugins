import type { ServiceDescriptorWithProps } from "@coremedia/service-agent";
import { serviceDescriptorFactory } from "@coremedia/service-agent";
import type BlobDisplayService from "./BlobDisplayService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createBlobDisplayServiceDescriptor = (): ServiceDescriptorWithProps<BlobDisplayService> =>
  serviceDescriptorFactory<BlobDisplayService>({
    name: "blobDisplayService",
  });
