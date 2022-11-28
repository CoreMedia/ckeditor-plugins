import { ContentReference } from "./ContentReferenceService";
import { serviceDescriptorFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";

export abstract class ContentImportService {
  abstract import(uri: string): Promise<ContentReference>;
}

/**
 *
 */
export function createContentImportServiceDescriptor(): ServiceDescriptorWithProps<ContentImportService> {
  return serviceDescriptorFactory<ContentImportService>({
    name: "contentImportService",
  });
}
