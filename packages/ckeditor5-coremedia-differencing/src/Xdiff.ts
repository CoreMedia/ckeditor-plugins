/**
 * Attributes used by server-side differencing.
 *
 * * **Key:** Name of attributes in data and editing view.
 * * **Value:** Name of attribute in model.
 */
export const XDIFF_ATTRIBUTES = {
  /**
   * Attribute, applied to images for example.
   */
  "xdiff:changetype": "xdiff-change-type",
  /**
   * Verbose description of changes. Unused yet.
   */
  "xdiff:changes": "xdiff-changes",
  /**
   * UI-Class that categorizes the change type.
   */
  "xdiff:class": "xdiff-class",
  /**
   * ID of the difference, which may be used, to jump between
   * changes. Unused yet.
   */
  "xdiff:id": "xdiff-id",
  /**
   * Reference to next diff for diff-navigation. Unused yet.
   */
  "xdiff:next": "xdiff-next",
  /**
   * Reference to previous diff for diff-navigation. Unused yet.
   */
  "xdiff:previous": "xdiff-previous",
};

/**
 * Extra element, server-side differencing augments the original data with.
 */
export const XDIFF_SPAN_ELEMENT_CONFIG: {
  view: string;
  model: string;
} = {
  view: "xdiff:span",
  model: "xdiff-span",
};
