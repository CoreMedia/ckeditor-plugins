import { serviceDescriptorFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";
import BlobDisplayService from "./BlobDisplayService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createBlobDisplayServiceDescriptor = (): ServiceDescriptorWithProps<BlobDisplayService> =>
  serviceDescriptorFactory<BlobDisplayService>({
    name: "blobDisplayService",
  });
