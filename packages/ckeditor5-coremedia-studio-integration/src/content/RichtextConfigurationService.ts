import { ServiceObject } from "@coremedia/service-agent";
import { UriPath } from "./UriPath";

/**
 * Provides access to configuration options for Richtext behavior within
 * an application such as CoreMedia Studio.
 *
 * The application is required providing an implementation for this
 * interface to use plugins based on this configuration.
 */
interface RichtextConfigurationService extends ServiceObject {
  /**
   * Signals, if the entity described by the given URI path (typically
   * a content) can be linked to from within Richtext.
   *
   * @param uripath URI path of the entity such as `content/42`
   */
  hasLinkableType(uripath: UriPath): Promise<boolean>;

  /**
   * Signals, if the entity described by the given URI path (typically
   * a content) can be embedded into Richtext. This typically applies to
   * contents holding media blobs such as images.
   *
   * @param uripath URI path of the entity such as `content/42`
   */
  isEmbeddableType(uripath: UriPath): Promise<boolean>;
}

export default RichtextConfigurationService;
