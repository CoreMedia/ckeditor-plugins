import type { ServiceDescriptorWithProps } from "@coremedia/service-agent";
import { serviceDescriptorFactory } from "@coremedia/service-agent";
import type { ContentSearchService } from "./ContentSearchService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createContentSearchServiceDescriptor = (): ServiceDescriptorWithProps<ContentSearchService> =>
  serviceDescriptorFactory<ContentSearchService>({
    name: "contentSearchService",
  });
