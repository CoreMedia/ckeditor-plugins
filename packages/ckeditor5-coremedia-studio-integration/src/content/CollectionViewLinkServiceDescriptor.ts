import { serviceDescriptorFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";
import { CollectionViewLinkService } from "./CollectionViewLinkService";

/**
 * Descriptor used to fetch service from service agent.
 */
export function createCollectionViewServiceDescriptor(): ServiceDescriptorWithProps<CollectionViewLinkService> {
  return serviceDescriptorFactory<CollectionViewLinkService>({
    name: "collectionViewLinkService",
  });
}
