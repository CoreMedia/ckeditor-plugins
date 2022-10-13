import { serviceDescFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";
import BlobDisplayService from "./BlobDisplayService";

/**
 * Descriptor used to fetch service from service agent.
 */
export function createBlobDisplayServiceDescriptor(): ServiceDescriptorWithProps<BlobDisplayService> {
  return serviceDescFactory<BlobDisplayService>({
    name: "workAreaService",
  });
}
