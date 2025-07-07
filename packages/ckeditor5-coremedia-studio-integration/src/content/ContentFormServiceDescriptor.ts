import { serviceDescriptorFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";
import ContentFormService from "./studioservices/ContentFormService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createContentFormServiceDescriptor = (): ServiceDescriptorWithProps<ContentFormService> =>
  serviceDescriptorFactory<ContentFormService>({
    name: "contentFormService",
  });
