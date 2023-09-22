import RequiredFrom, { withDefaults } from "./RequiredFrom";
import MockContentObject from "./MockContentObject";
import RequireOnly from "./RequireOnly";

/**
 * Content types may be anything. But for example `folder` and `document`
 * may trigger different behavior. Any custom type should be regarded as
 * subtype of `document`.
 */
type MockContentType = "folder" | "document" | string;

/**
 * Tries to guess a (simple) content type, which just distinguishes by
 * ID, same as done in CoreMedia CMS. Thus, an even ID represents a document
 * while an odd ID represents a folder.
 *
 * Note, that from mocking it is not required to stick to the ID/type pattern.
 * Thus, it is perfectly fine having a configuration such as:
 *
 * ```
 * {
 *   id: 2,
 *   type: "folder",
 * }
 * ```
 *
 * But for `{ id: 2 }`, the default type will evaluate to `document` here.
 */
const defaultTypeById = (id: number): "folder" | "document" => {
  const isDocument = id % 2 === 0;
  return isDocument ? "document" : "folder";
};

/**
 * Represents properties an object having a content type should have.
 */
interface MockContentTypeSpecificProperties extends MockContentObject {
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

const MockContentTypeSpecificPropertiesDefaults: Omit<MockContentTypeSpecificProperties, "id" | "type" | "linkable"> = {
  embeddable: false,
};

/**
 * Provides defaults for the given ID. Provides some minor magic, like for
 * example guessing a type from the ID and guessing `linkable` state from
 * type (all documents are expected to be linkable by default).
 */
const getTypeDefaults = (config: MockContentTypeSpecificPropertiesConfig): MockContentTypeSpecificProperties => {
  const { id } = config;
  const type = config.type ?? defaultTypeById(id);
  return {
    id,
    type,
    linkable: "folder" !== type,
    ...MockContentTypeSpecificPropertiesDefaults,
  };
};

/**
 * Content Type properties for configuration purpose.
 */
type MockContentTypeSpecificPropertiesConfig = RequireOnly<MockContentTypeSpecificProperties, "id">;

/**
 * Adds defaults for content type to the given configuration. If type is unset,
 * it is guessed from the ID.
 *
 * @param config - configuration
 */
const withTypeDefaults = <T extends MockContentTypeSpecificPropertiesConfig>(
  config: T,
): RequiredFrom<T, MockContentTypeSpecificProperties> => withDefaults(config, getTypeDefaults(config));

export default MockContentType;
export {
  withTypeDefaults,
  getTypeDefaults,
  defaultTypeById,
  MockContentTypeSpecificPropertiesConfig,
  MockContentTypeSpecificProperties,
};
