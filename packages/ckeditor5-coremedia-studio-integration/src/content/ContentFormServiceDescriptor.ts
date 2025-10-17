import type { ServiceDescriptorWithProps } from "@coremedia/service-agent";
import { serviceDescriptorFactory } from "@coremedia/service-agent";
import type ContentFormService from "./studioservices/ContentFormService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createContentFormServiceDescriptor = (): ServiceDescriptorWithProps<ContentFormService> =>
  serviceDescriptorFactory<ContentFormService>({
    name: "contentFormService",
  });
