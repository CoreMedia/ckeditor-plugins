export class TaggedElement {
  /**
   * If this element requires a separator before and/or after.
   */
  separator?: {
    before?: string;
    after?: string;
  };
  /**
   * Signals detected heading level.
   */
  heading?: number;
  /**
   * Signal, if this element is considered **bold**.
   */
  bold?: boolean;
  /**
   * Signal, if this element is considered _italic_.
   */
  italic?: boolean;
  /**
   * Signal, if this element is considered underlined.
   */
  underline?: boolean;
  /**
   * Signal, if this element is considered as ~~strikethrough~~.
   */
  strikethrough?: boolean;
  /**
   * Signal, if any alignment is to be applied.
   */
  alignment?: "center" | "left" | "right";
  /**
   * Signal, if any color should be set.
   */
  color?: string;
  /**
   * Signal, if any font size should be set.
   */
  size?: number;
  /**
   * Signal, if to create an `[url]` element, and if given as string, what
   * link target value should be set.
   */
  link?: boolean | string;
  /**
   * Signal, if to reference an image, and if, what are the properties to take
   * into account.
   */
  image?: {
    url: string;
    width?: number;
    height?: number;
  };
  /**
   * Signal, if the element wraps list items, and if it should be considered
   * ordered or unordered.
   */
  list?: "unordered" | "ordered";
  /**
   * Signal, if the element is considered a list item.
   */
  listItem?: boolean;
  code?: boolean | string = false;
  preformatted?: boolean;
  table?: boolean;
  tableRow?: boolean;
  tableCell?: "data" | "heading";
  [tagName: string]: unknown;
  constructor(public readonly element: HTMLElement) {}
}
