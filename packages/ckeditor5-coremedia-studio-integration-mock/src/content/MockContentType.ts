/**
 * Mock content type, which is either a folder or a document. As alternative,
 * you may set any string, which then will be handled as document of a given
 * type.
 */
import RequireOnly from "./RequireOnly";
import RequiredFrom from "./RequiredFrom";

type MockContentType = "folder" | "document" | string;

/**
 * Represents properties an object having a content type should have.
 */
interface MockContentTypeSpecificProperties {
  /**
   * The content-type of the content.
   */
  type: MockContentType;
  /**
   * If the content may be referenced in internal links.
   */
  linkable: boolean;
  /**
   * If the content may be embedded.
   */
  embeddable: boolean;
}

/**
 * Content Type properties for configuration purpose (thus, only requiring
 * type).
 */
type MockContentTypeSpecificPropertiesConfig = RequireOnly<MockContentTypeSpecificProperties, "type">;

/**
 * Adds defaults for content type to the given configuration.
 *
 * @param config - configuration
 */
const withTypeDefaults = <T extends MockContentTypeSpecificPropertiesConfig>(
  config: T
): RequiredFrom<T, MockContentTypeSpecificProperties> => {
  const { type, linkable, embeddable } = config;
  const defaults: MockContentTypeSpecificProperties = {
    type,
    linkable: linkable ?? true,
    embeddable: embeddable ?? false,
  };
  return { ...defaults, ...config };
};

export default MockContentType;
export { withTypeDefaults, MockContentTypeSpecificPropertiesConfig, MockContentTypeSpecificProperties };
