import DisplayHint from "./DisplayHint";

/**
 * Represents a content, which shall be rendered as link the CKEditor UI.
 *
 * It is **not** meant providing information such as the content name for any
 * other purpose than for display in the UI. For example, it should not be used
 * to determine a content name to be written into the CKEditor view. It requires
 * some different handling of unreadable content for example.
 *
 * This representation expects a layout similar to this (nested DOM elements):
 *
 * ```text
 * +--- class=content.classes ---+
 * |                             |
 * | +-- class=type.classes ---+ |
 * | | ARIA Info: type.name    | |
 * | +-------------------------+ |
 * |                             |
 * | +-------------------------+ |
 * | | content.name            | |
 * | +-------------------------+ |
 * |                             |
 * | +-- class=state.classes --+ |
 * | | ARIA Info: state.name   | |
 * | +-------------------------+ |
 * |                             |
 * +-----------------------------+
 * ```
 */
interface ContentAsLink {
  /**
   * General information of a content as its name and possibly some
   * CSS classes to apply on the overall display of the content.
   *
   * For unreadable contents, it will contain information how to display
   * a corresponding placeholder for the content.
   */
  content: DisplayHint;
  /**
   * Information on the type of a content. The name, containing the
   * localized type, is typically used as ARIA information, while the classes
   * are meant to be applied to display a corresponding content type icon.
   *
   * For unreadable content, it is expected that the content type is not
   * exposed but represented by a generic _unreadable_ placeholder.
   */
  type: DisplayHint;
  /**
   * Information on the state of a content. This is something like
   * checked-in, checked-out, checked-out by other, published, ...
   * The name is used for ARIA and expected to contain some localized
   * representation of the state.
   * The classes are applied to the display element and expected to trigger
   * some state-icon to appear.
   *
   * For unreadable content, it is expected that no state information is
   * leaked, despite some hints on unreadable state.
   */
  state: DisplayHint;
}

export default ContentAsLink;
