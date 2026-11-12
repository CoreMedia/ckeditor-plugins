import type { ServiceDescriptorWithProps } from "@coremedia/service-agent";
import { serviceDescriptorFactory } from "@coremedia/service-agent";
import type { CollectionViewLinkService } from "./CollectionViewLinkService";

/**
 * Descriptor used to fetch service from service agent.
 */
export function createCollectionViewLinkServiceDescriptor(): ServiceDescriptorWithProps<CollectionViewLinkService> {
  return serviceDescriptorFactory<CollectionViewLinkService>({
    name: "collectionViewLinkService",
  });
}
