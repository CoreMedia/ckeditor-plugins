import { serviceDescriptorFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";

export abstract class ContentReferenceService {
  abstract getContentReferences(requests: ContentReferenceRequest[]): Promise<ContentReferenceResponse[]>;

  abstract getContentReference(requests: ContentReferenceRequest): Promise<ContentReferenceResponse>;
}

export interface ContentReferenceResponse {
  /**
   * The URI or UUID the information is requested for.
   */
  request: ContentReferenceRequest;

  /**
   * Reference information containing uri and uuid.
   *
   * If the requestedUri is the same as the content.uri a content object already exist for the given URI.
   * In this case a UUID is also available.
   * Otherwise, content is undefined.
   */
  content: ContentReference | undefined;

  /**
   * Information about the returned ContentReference.
   */
  contentReferenceInformation: ContentReferenceInformation;
}

/**
 * Some more detailed information about a ContentReference.
 */
export interface ContentReferenceInformation {
  /**
   * True if a UUID is requested. If a URI is requested this is true if it is a content uri, otherwise false.
   */
  isContent: boolean;

  /**
   * True if the system knows to handle the given request.uri generally, otherwise false.
   * If request.uuid is not set, this property is undefined, as uuid means an explicit content request.
   *
   * Example: Content-URI, Third-Party URIs (content hub, ...).
   */
  isKnownUriPattern: boolean | undefined;
}

export interface ContentReference {
  uri: string;
  uuid: string;
}

/**
 * Same as ContentReference but properties are optional. At least one has to be set.
 */
export interface ContentReferenceRequest {
  uri?: string;
  uuid?: string;
}

/**
 *
 */
export const createContentReferenceServiceDescriptor = (): ServiceDescriptorWithProps<ContentReferenceService> =>
  serviceDescriptorFactory<ContentReferenceService>({
    name: "contentReferenceService",
  });
