import type { UriPath } from "./UriPath";

/**
 * Provides access to configuration options for Richtext behavior within
 * an application such as CoreMedia Studio.
 *
 * The application is required providing an implementation for this
 * interface to use plugins based on this configuration.
 */
interface RichtextConfigurationService {
  /**
   * Signals, if the entity described by the given URI path (typically
   * a content) can be linked to from within Richtext.
   *
   * @param uriPath - URI path of the entity such as `content/42`
   */
  hasLinkableType(uriPath: UriPath): Promise<boolean>;

  /**
   * Signals, if the entity described by the given URI path (typically
   * a content) can be embedded into Richtext. This typically applies to
   * contents holding media blobs such as images.
   *
   * @param uriPath - URI path of the entity such as `content/42`
   */
  isEmbeddableType(uriPath: UriPath): Promise<boolean>;

  /**
   * Resolves the URI-Path to a Blob-Property reference, which then
   * may be used as `xlink:href` for `<img>` elements.
   *
   * Producers have to transform the given URI-path like `content/42`
   * to some blob-property reference, such as `content/42#properties.data`.
   * In general, the method is only called, when a content has previously
   * been identified as being _embeddable_.
   *
   * @param uriPath - URI path of the entity such as `content/42`
   */
  resolveBlobPropertyReference(uriPath: UriPath): Promise<string>;
}

export default RichtextConfigurationService;
