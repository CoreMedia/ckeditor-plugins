import { serviceDescriptorFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";

export abstract class ContentImportService {
  abstract import(uri: string): Promise<string>;
}

/**
 * Service for Studio's Content Import functionality to be registered with the
 * `serviceAgent`.
 *
 * Studio can convert different types of data into content items.
 * That process is called Content Import.
 * Any referenced data, like an item in a Studio's third-party system, can be imported and returned by using this service.
 *
 * @see serviceAgent
 */
export function createContentImportServiceDescriptor(): ServiceDescriptorWithProps<ContentImportService> {
  return serviceDescriptorFactory<ContentImportService>({
    name: "contentImportService",
  });
}
