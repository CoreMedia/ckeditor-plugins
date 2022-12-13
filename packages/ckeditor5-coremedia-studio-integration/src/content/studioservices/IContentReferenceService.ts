import { serviceDescriptorFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IContentReferenceService {
  getContentReferences(requests: string[]): Promise<ContentReferenceResponse[]>;

  getContentReference(request: string): Promise<ContentReferenceResponse>;
}

export interface ContentReferenceResponse {
  /**
   * The URI or UUID the information is requested for.
   */
  request: string;

  /**
   * Reference information containing uri and uuid.
   *
   * If the requestedUri is the same as the content.uri a content object already exist for the given URI.
   * In this case a UUID is also available.
   * Otherwise, content is undefined.
   */
  contentUri: string | undefined;

  /**
   *
   */
  externalUriInformation: ExternalUriInformation | undefined;
}

export interface ExternalUriInformation {
  mappedContentType: string;
  contentUri: string | undefined;
}

/**
 *
 */
export const createContentReferenceServiceDescriptor = (): ServiceDescriptorWithProps<IContentReferenceService> =>
  serviceDescriptorFactory<IContentReferenceService>({
    name: "contentReferenceService",
  });
