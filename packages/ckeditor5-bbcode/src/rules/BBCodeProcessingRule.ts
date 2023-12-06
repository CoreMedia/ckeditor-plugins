export interface BBCodeProcessingRule {
  /**
   * Some ID solely used for debugging purpose. Recommended to keep unique
   * among rules, though.
   */
  readonly id: string;
  /**
   * BBCode tags, this rule is related to. Automatically also registers tags
   * as known to BBCode to HTML processing.
   *
   * Typically, you list tags here, which are generated during `toData`
   * mapping.
   */
  readonly tags?: string[];
  /**
   * `toView` mapping, thus, BBCode to HTML relies on third-party tooling.
   * No extension point available.
   */
  readonly toView?: never;
  /**
   * Transforms an element or parts of it to BBCode. Typical rules will
   * apply mapping according to the element type, name or one of its
   * attributes.
   *
   * It is recommended to clean any consumed attribute values, to signal
   * that they got processed.
   *
   * @param element - element to transform
   * @param content - the current BBCode
   * @returns the new BBCode to continue with; `undefined` to continue with BBCode as is.
   */
  readonly toData?: (element: HTMLElement, content: string) => undefined | string;
}
