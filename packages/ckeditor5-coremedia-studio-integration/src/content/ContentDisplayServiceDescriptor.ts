import type { ServiceDescriptorWithProps } from "@coremedia/service-agent";
import { serviceDescriptorFactory } from "@coremedia/service-agent";
import type ContentDisplayService from "./ContentDisplayService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createContentDisplayServiceDescriptor = (): ServiceDescriptorWithProps<ContentDisplayService> =>
  serviceDescriptorFactory<ContentDisplayService>({
    name: "contentDisplayService",
  });
