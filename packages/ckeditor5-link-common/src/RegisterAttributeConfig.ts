/**
 * To benefit from CKEditor's Link Feature integration and its
 * handling of cursor position, all model names of related
 * link attributes should start with `link`. This type helps to
 * apply to the recommended name pattern.
 */
export type LinkAttributeName = `link${string}`;

/**
 * Configuration to register attribute bound to link.
 */
export interface RegisterAttributeConfig {
  /**
   * Model name. Recommended to be prefixed with `link`.
   */
  model: LinkAttributeName;
  /**
   * Name of attribute in view.
   *
   * Assumed to be identical in editing and data view.
   */
  view: string;
}

/**
 * Validate if value contains required attributes.
 *
 * @param value - value to guard
 * @param value.model - attribute name in model
 * @param value.view - attribute name in view (data and editing view)
 */
const hasModelAndView = (value: { model?: unknown; view?: unknown }): value is RegisterAttributeConfig => {
  const { model, view } = value;

  if (typeof model === "string" && typeof view === "string") {
    if (model.startsWith("link")) {
      return true;
    }
  }
  return false;
};

/**
 * Type guard for `RegisterAttributeConfig`.
 *
 * @param value - value to guard
 */
export const isRegisterAttributeConfig = (value: unknown): value is RegisterAttributeConfig => {
  if (!value || typeof value !== "object") {
    return false;
  }
  return hasModelAndView(value);
};
