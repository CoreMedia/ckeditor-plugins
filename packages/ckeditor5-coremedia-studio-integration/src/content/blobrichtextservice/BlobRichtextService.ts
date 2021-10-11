import { UriPath } from "../UriPath";
import { ServiceObject } from "@coremedia/service-agent";

export interface BlobRichtextService extends ServiceObject {
  /**
   * Finds the property of the image that must be rendered.
   *
   * First lookup if the given content type has a configured embedded property.
   *
   * If there is no configured one all properties of the content type are considered.
   * The lookup searches for the first property which fulfills the following conditions:
   * * mime type is image/*
   * * property is not empty - has data
   *
   * @param uriPath
   */
  findImageBlobProperty(uriPath: UriPath): Promise<string | null>;
}
