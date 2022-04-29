import { URI_LIST_DATA } from "./Constants";
import { BeanReference, parseBeanReferences } from "./BeanReference";

/**
 * Artificial interface, which describes the various representations of
 * `DataTransfer` used within `lib-dom` and in CKEditor.
 */
export interface HasData {
  getData(format: string): string;
}

/**
 * Type-Guard, if the given value represents an object similar to
 * a `DataTransfer` object.
 *
 * @param value - object to validate
 */
export const isHasData = (value: unknown): value is HasData => {
  if (typeof value !== "object" || !value || !("getData" in value)) {
    return false;
  }
  const raw: unknown = (value as HasData).getData;
  return typeof raw === "function";
};

/**
 * Artificial interface, which describes the various representations of
 * instances providing a `DataTransfer` property used within `lib-dom`
 * and in CKEditor.
 */
export interface HasDataTransfer {
  dataTransfer: HasData;
}

/**
 * Artificial interface, which describes the various representations of
 * instances providing a `DataTransfer` property used within `lib-dom`
 * and in CKEditor.
 */
export interface HasNullableDataTransfer {
  dataTransfer: HasData | null;
}

/**
 * Type-Guard, if the given value represents an object similar to, for example,
 * a `DragEvent` holding a `dataTransfer` property.
 *
 * @param value - object to validate
 */
export const isHasDataTransfer = (value: unknown): value is HasDataTransfer => {
  if (typeof value !== "object" || !value || !("dataTransfer" in value)) {
    return false;
  }
  const raw: unknown = (value as HasDataTransfer).dataTransfer;
  return isHasData(raw);
};

/**
 * Transforms the provided value to some data-transfer compatible object.
 *
 * @param dataTransferOrHolder - object to transform; `null` accepted for
 * convenience
 * @returns `DataTransfer` compatible object; `undefined` if it is not
 * compatible (especially, if it is `null`).
 */
export const toDataTransfer = (dataTransferOrHolder: HasData | HasNullableDataTransfer | null): HasData | undefined => {
  if (isHasDataTransfer(dataTransferOrHolder)) {
    return dataTransferOrHolder.dataTransfer;
  }
  if (isHasData(dataTransferOrHolder)) {
    return dataTransferOrHolder;
  }
  return undefined;
};

/**
 * Retrieves bean-references possibly stored in `cm/uri-list`.
 *
 * @param dataTransferOrHolder - data-transfer compatible object or an object
 * providing a compatible data-transfer reference;
 * accepts `null` for convenience
 * @returns parsed bean references (possibly empty); `undefined` if data for
 * `cm/uri-list` do not exist or cannot be parsed.
 * Always `undefined` for `null`.
 */
export const getUriList = (
  dataTransferOrHolder: HasData | HasNullableDataTransfer | null
): BeanReference[] | undefined => {
  const json = toDataTransfer(dataTransferOrHolder)?.getData(URI_LIST_DATA);
  if (!json) {
    return undefined;
  }
  return parseBeanReferences(json);
};

/**
 * Retrieve URI-paths (e.g., `content/42`) possibly stored in `cm/uri-list`.
 *
 * @param dataTransferOrHolder - data-transfer compatible object or an object
 * providing a compatible data-transfer reference;
 * accepts `null` for convenience
 * @returns parsed bean reference URI-paths (possibly empty); `undefined` if
 * data for `cm/uri-list` do not exist or cannot be parsed.
 * Always `undefined` for `null`.
 */
export const getUriListValues = (
  dataTransferOrHolder: HasData | HasNullableDataTransfer | null
): string[] | undefined => {
  return getUriList(dataTransferOrHolder)?.map((ref) => ref.$Ref);
};
