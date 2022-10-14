import { serviceDescriptorFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";
import ContentDisplayService from "./ContentDisplayService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createContentDisplayServiceDescriptor = (): ServiceDescriptorWithProps<ContentDisplayService> =>
  serviceDescriptorFactory<ContentDisplayService>({
    name: "contentDisplayService",
  });
