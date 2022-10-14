import { serviceDescFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";
import ContentDisplayService from "./ContentDisplayService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createContentDisplayServiceDescriptor = (): ServiceDescriptorWithProps<ContentDisplayService> =>
  serviceDescFactory<ContentDisplayService>({
    name: "contentDisplayService",
  });
