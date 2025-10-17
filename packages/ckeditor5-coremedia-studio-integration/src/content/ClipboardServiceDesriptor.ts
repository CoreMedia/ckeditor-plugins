import type { ServiceDescriptorWithProps } from "@coremedia/service-agent";
import { serviceDescriptorFactory } from "@coremedia/service-agent";
import type ClipboardService from "./studioservices/ClipboardService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createClipboardServiceDescriptor = (): ServiceDescriptorWithProps<ClipboardService> =>
  serviceDescriptorFactory<ClipboardService>({
    name: "clipboardService",
  });
