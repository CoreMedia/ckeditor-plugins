import {
  MockContentTypeSpecificProperties,
  MockContentTypeSpecificPropertiesConfig,
  withTypeDefaults,
} from "./MockContentType";
import Delayed, { DelayedConfig, withDelayDefaults } from "./Delayed";
import { MutableProperties, MutablePropertiesConfig, withPropertiesDefaults } from "./MutableProperties";
import { capitalize, isObject } from "./MockContentUtils";
import MockContentObject, { isMockContentObject } from "./MockContentObject";

interface MockContent extends MockContentObject, Delayed, MockContentTypeSpecificProperties, MutableProperties {}

type MockContentConfig = MockContentObject &
  DelayedConfig &
  MockContentTypeSpecificPropertiesConfig &
  MutablePropertiesConfig;

/**
 * Type-Guard if object represents a `MockContentConfig`.
 *
 * @param value - object to identify
 */
const isMockContentConfig = (value: unknown): value is MockContentConfig => {
  return isObject(value) && value.hasOwnProperty("id");
};

/**
 * Type-Guard if object represents an array `MockContentConfig`.
 *
 * @param value - object to identify
 * @returns `true` iff. array is empty or all entries represent a `MockContentConfig`.
 */
const isMockContentConfigs = (value: unknown): value is MockContentConfig[] => {
  if (!Array.isArray(value)) {
    return false;
  }
  return value.every<unknown>(isMockContentObject);
};

/**
 * We override the default name from `MutableProperties`, as we now know some
 * more details (here: the ID and type).
 *
 * @param input - mock content configuration
 */
const defaultNameSupplier = (input: MockContentObject & Pick<MockContentTypeSpecificProperties, "type">): string => {
  if (input.id === 1) {
    // Special handling for root folder.
    return "";
  }
  return `${capitalize(input.type)} #${input.id}`;
};

/**
 * Provides a mock content based on the given configuration.
 *
 * @param config - configuration of the content, will be possibly enhanced by some defaults
 */
const withContentDefaults = <T extends MockContentConfig>(config: T): MockContent => {
  const delayDefaultsApplied = withDelayDefaults(config);
  const typeDefaultsApplied = withTypeDefaults({
    // Provide a default name respecting the type.
    // The function is then called once in `withPropertiesDefaults` to provide
    // a static value instead.
    name: defaultNameSupplier,
    ...delayDefaultsApplied,
  });
  // noinspection UnnecessaryLocalVariableJS
  const propertyDefaultsApplied = withPropertiesDefaults(typeDefaultsApplied);
  // Now all methods should be resolved, all values provided.
  return propertyDefaultsApplied;
};

/**
 * Provides a mock content as static content with some reasonable defaults, such
 * as assuming (as in CoreMedia CMS), that odd ids represent folders, while even
 * ids represent documents.
 *
 * @param id - id of the content
 */
const asStaticContent = (id: number): MockContent => {
  const isDocumentId = id % 2 === 0;
  const type = isDocumentId ? "document" : "folder";
  // By default, we assume that only documents are linkable.
  const linkable = isDocumentId;
  const name: string[] = [defaultNameSupplier({ id, type })];
  return {
    id,
    type,
    linkable,
    name,
    editing: [false],
    readable: [true],
    embeddable: false,
    blob: [null],
    // Resolved immediately.
    initialDelayMs: 0,
    // Irrelevant, as we are static.
    changeDelayMs: 1,
  };
};

export default MockContent;
export { withContentDefaults, asStaticContent, isMockContentConfig, isMockContentConfigs, MockContentConfig };
