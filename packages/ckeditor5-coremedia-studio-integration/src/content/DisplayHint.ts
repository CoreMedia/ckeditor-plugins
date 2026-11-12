/**
 * A general display hint for an element to represent in the CKEditor UI.
 *
 * Many hints may change its state concurrently, such as a content's name
 * or state. Thus, `DisplayHints` should be observed for changes.
 *
 * A display hint may also refer to some unreadable content. Just as before,
 * this state may change, if contents are moved. In this case it is important
 * not to expose any compromising details of a content in the UI. For the
 * content's name you will typically want to provide a localized placeholder
 * text instead. For the content's state you most likely want to even hide
 * the state. The content type hint is expected to transparently change
 * to an _unreadable_ hint, which is that for example a lock symbol is shown
 * instead of a content-type icon.
 */
interface DisplayHint {
  /**
   * The name of the entity to display.
   *
   * This may be the name of a content (which will be directly visible in UI)
   * or the localized name of a state or content-type. For any other information
   * than the content name, it is expected, that these names are for example
   * used for ARIA support.
   *
   * Ensure not to compromise sensitive data for unreadable contents here.
   *
   * The returned string will be correctly encoded within the CKEditor UI.
   */
  readonly name: string;
  /**
   * Style classes to apply to displayed entity.
   *
   * Such style classes may for example colorize a displayed content based
   * on its type (or state, like unreadable) or it may trigger icons to displayed
   * in the UI, for example the icon of a given content type.
   */
  readonly classes?: string[];
}

export default DisplayHint;
