import { isHTMLElement } from "./TypeGuards";

export { isHTMLElement } from "./TypeGuards";

export const wrapIfHTMLElement = (delegate: Node | HTMLElement): HTMLElementWrapper | undefined => {
  if (isHTMLElement(delegate)) {
    return new HTMLElementWrapper(delegate);
  }
  return undefined;
};

/**
 * Default suggested prefix for class-names denoting artificial elements
 * representing data attributes.
 */
export const defaultDataAttributeClassNamePrefix = "dataset--";

/**
 * Default artificial element name to hold data attribute values.
 */
export const defaultDataAttributeElementName: keyof HTMLElementTagNameMap = "span";

export class HTMLElementWrapper {
  readonly #delegate: HTMLElement;

  constructor(delegate: HTMLElement) {
    this.#delegate = delegate;
  }

  /**
   * Get owner document.
   */
  get ownerDocument(): Document {
    return this.#delegate.ownerDocument;
  }

  get element(): HTMLElement {
    return this.#delegate;
  }

  moveDataAttributesToChildElements(
    elementName: keyof HTMLElementTagNameMap | string = defaultDataAttributeElementName,
    classNamePrefix: string = defaultDataAttributeClassNamePrefix,
  ): void {
    const { ownerDocument, element } = this;

    for (const key in element.dataset) {
      const value = element.dataset[key];
      if (value) {
        const artificialElement = ownerDocument.createElement(elementName);
        artificialElement.classList.add(`${classNamePrefix}${key}`);
        artificialElement.textContent = value;
        element.insertAdjacentElement("afterbegin", artificialElement);
      }
      // no-dynamic-delete: I do not see any better option here to remove
      // the data attribute without mangling with the attribute name, which
      // again may open a door to XSS attacks if not carefully designed.

      delete element.dataset[key];
    }
  }

  moveDataAttributeChildElementToDataAttributes(
    elementName: keyof HTMLElementTagNameMap | string = defaultDataAttributeElementName,
    classNamePrefix: string = defaultDataAttributeClassNamePrefix,
  ): void {
    const { element } = this;
    [...element.children].forEach((child) => {
      const { localName, className } = child;
      if (localName === elementName && className.startsWith(classNamePrefix)) {
        const { textContent } = child;
        if (textContent) {
          const dataKey = className.substring(classNamePrefix.length);
          element.dataset[dataKey] = textContent;
        }
        child.remove();
      }
    });
  }
}
