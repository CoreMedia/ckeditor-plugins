import { serviceDescriptorFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";
import ContentSearchService from "./ContentSearchService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createContentSearchServiceDescriptor = (): ServiceDescriptorWithProps<ContentSearchService> =>
  serviceDescriptorFactory<ContentSearchService>({
    name: "contentSearchService",
  });
