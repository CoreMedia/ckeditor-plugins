/* eslint no-null/no-null: off */

import { AtomicOrArray, isObject } from "./MockContentUtils";
import MigrateTo from "./MigrateTo";
import { observeMutableProperty } from "./ObservableMutableProperty";
import Delayed from "./Delayed";
import { Observable } from "rxjs";

/**
 * Represents BLOB data, which are stored as content-property.
 */
interface BlobData {
  /**
   * The URL to retrieve the blob data from. In CoreMedia Studio,
   * this would be the data-URL to be read from Studio Server.
   */
  value: string;
  /**
   * The MIME-type of the blob.
   */
  mime: string;
}

/**
 * Type guard to check, if the given value represents `BlobData`.
 *
 * @param value - value to validate
 */
const isBlobData = (value: unknown): value is BlobData => {
  if (!isObject(value)) {
    return false;
  }
  const hasValue = () => value.hasOwnProperty("value") && typeof value.value === "string";
  const hasMime = () => value.hasOwnProperty("mime") && typeof value.mime === "string";
  return hasValue() && hasMime();
};

/**
 * Type to represent blob properties.
 */
type BlobType = BlobData | null;
/**
 * Represents the BLOB at configuration time. A string will be transformed
 * to `BlobData` with corresponding value and default MIME-type `image/png`.
 */
type BlobTypeConfig = BlobData | string | null;
/**
 * Type to represent editing state.
 */
type EditingType = boolean;
/**
 * Type to represent the content name.
 */
type NameType = string;
/**
 * Type to represent the readable state.
 */
type ReadableType = boolean;

/**
 * Represents mutable property set.
 */
interface MutableProperties {
  name: NameType[];
  editing: EditingType[];
  readable: ReadableType[];
  blob: BlobType[];
}

/**
 * Represents mutable properties as given in the configuration. This provides
 * some convenience, which is later mapped to `MutableProperties`.
 */
interface MutablePropertiesConfig {
  name?: AtomicOrArray<NameType>;
  editing?: AtomicOrArray<EditingType>;
  readable?: AtomicOrArray<ReadableType>;
  blob?: AtomicOrArray<BlobTypeConfig>;
}

/**
 * Providers for defaults. Only called, when given properties are unset.
 * Providers may access the full original configuration object (for example,
 * to derive properties from other properties), despite the given property, as
 * this is unset when being called.
 */
interface MutablePropertiesDefaultProviders<T extends MutablePropertiesConfig = MutablePropertiesConfig> {
  /**
   * Provider for default name (or just providing a static name).
   */
  name?: NameType | ((input: Omit<T, "name">) => NameType);
  /**
   * Provider for default editing state (or just provided as static value).
   */
  editing?: EditingType | ((input: Omit<T, "editing">) => EditingType);
  /**
   * Provider for default readable state (or just provided as static value).
   */
  readable?: ReadableType | ((input: Omit<T, "readable">) => ReadableType);
  /**
   * Provider for blob property value (or just provided as static value).
   */
  blob?: BlobTypeConfig | ((input: Omit<T, "blob">) => BlobTypeConfig);
}

/**
 * Internal representation only using functions.
 */
interface InternalMutablePropertiesDefaultProviders<T extends MutablePropertiesConfig = MutablePropertiesConfig> {
  name: (input: Omit<T, "name">) => NameType;
  editing: (input: Omit<T, "editing">) => EditingType;
  readable: (input: Omit<T, "readable">) => ReadableType;
  blob: (input: Omit<T, "blob">) => BlobTypeConfig;
}

/**
 * A default provider for property defaults.
 */
const MutablePropertiesDefaultDefaultProviders: Required<MutablePropertiesDefaultProviders> = {
  name: () => `Some Name ${Math.random()}`,
  editing: false,
  readable: true,
  blob: null,
};

/**
 * Ensures, that all default property providers exist and are functions.
 *
 * @param input - default providers, which are more convenient
 */
const transformDefaultProviders = <T extends MutablePropertiesConfig>(
  input: MutablePropertiesDefaultProviders<T>,
): InternalMutablePropertiesDefaultProviders<T> => {
  const allSet = { ...MutablePropertiesDefaultDefaultProviders, input };
  const { name: defaultName, editing: defaultEditing, readable: defaultReadable, blob: defaultBlob } = allSet;
  return {
    name: typeof defaultName === "string" ? () => defaultName : defaultName,
    editing: typeof defaultEditing === "boolean" ? () => defaultEditing : defaultEditing,
    readable: typeof defaultReadable === "boolean" ? () => defaultReadable : defaultReadable,
    blob:
      defaultBlob === null || typeof defaultBlob === "string" || isBlobData(defaultBlob)
        ? () => defaultBlob
        : defaultBlob,
  };
};

/**
 * Transforms Blob configurations. Especially handles shortcuts of blobs just
 * given as plain strings, which are now wrapped into a `BlobData`
 * representation with default MIME-type `image/png`.
 *
 * @param config - blob configuration to transform
 */
const transformBlobConfig = (config: AtomicOrArray<BlobTypeConfig>): BlobType[] => {
  const configs = ([] as BlobTypeConfig[]).concat(config);
  return configs.map((c) => {
    if (!c) {
      return null;
    }
    if (typeof c === "string") {
      return {
        value: c,
        mime: "image/png",
      };
    }
    return c;
  });
};

/**
 * Transforms the configuration, so that it contains default mutable properties
 * where required, and migrates them all to array representation.
 *
 * @param config - configuration to process
 * @param defaultProviders - strategies to create defaults if property is unset
 */
const withPropertiesDefaults = <T extends MutablePropertiesConfig>(
  config: T,
  defaultProviders: MutablePropertiesDefaultProviders<T> = MutablePropertiesDefaultDefaultProviders,
): MigrateTo<T, MutableProperties> => {
  const { name, editing, readable, blob } = config;
  const transformedProviders = transformDefaultProviders(defaultProviders);
  const intermediateName: string[] | string = name ?? transformedProviders.name(config);
  const intermediateEditing = editing ?? transformedProviders.editing(config);
  const intermediateReadable = readable ?? transformedProviders.readable(config);
  const intermediateBlob = blob ?? transformedProviders.blob(config);

  return {
    ...config,
    name: ([] as NameType[]).concat(intermediateName),
    editing: ([] as EditingType[]).concat(intermediateEditing),
    readable: ([] as ReadableType[]).concat(intermediateReadable),
    blob: transformBlobConfig(intermediateBlob),
  };
};

/**
 * Plain observable for name, not respecting any other properties like
 * especially `readable`.
 *
 * @param config - delay and value configuration
 */
const observeName = (config: Delayed & Pick<MutableProperties, "name">): Observable<string> => {
  const { name } = config;
  return observeMutableProperty(config, name);
};

/**
 * Plain observable for editing, not respecting any other properties like
 * especially `readable`.
 *
 * @param config - delay and value configuration
 */
const observeEditing = (config: Delayed & Pick<MutableProperties, "editing">): Observable<boolean> => {
  const { editing } = config;
  return observeMutableProperty(config, editing);
};

/**
 * Observable for readable state.
 *
 * @param config - delay and value configuration
 */
const observeReadable = (config: Delayed & Pick<MutableProperties, "readable">): Observable<boolean> => {
  const { readable } = config;
  return observeMutableProperty(config, readable);
};

/**
 * Plain observable for BLOB value, not respecting any other properties like
 * especially `readable`.
 *
 * @param config - delay and value configuration
 */
const observeBlob = (config: Delayed & Pick<MutableProperties, "blob">): Observable<BlobType> => {
  const { blob } = config;
  return observeMutableProperty(config, blob);
};

export {
  BlobTypeConfig,
  BlobData,
  BlobType,
  EditingType,
  MutableProperties,
  MutablePropertiesConfig,
  MutablePropertiesDefaultDefaultProviders,
  MutablePropertiesDefaultProviders,
  NameType,
  ReadableType,
  observeBlob,
  observeEditing,
  observeName,
  observeReadable,
  withPropertiesDefaults,
};
