import { serviceDescFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";
import ContentDisplayService from "./ContentDisplayService";

/**
 * Descriptor used to fetch service from service agent.
 */
export function createContentDisplayServiceDescriptor(): ServiceDescriptorWithProps<ContentDisplayService> {
  return serviceDescFactory<ContentDisplayService>({
    name: "workAreaService",
  });
}
