import { capitalize } from "@coremedia/ckeditor5-common";
import { describeAttr } from "@coremedia/ckeditor5-dom-support";

export const xLinkNamespaceUri = "http://www.w3.org/1999/xlink";
export const xLinkPrefix = "xlink";
export const xLinkAttributes = ["type", "href", "role", "title", "show", "actuate"];
export type XLinkAttributeKey = (typeof xLinkAttributes)[number];
export type XLinkAttributes = Partial<Record<XLinkAttributeKey, string>>;
export type XLinkAttributeQualifiedName = `${typeof xLinkPrefix}:${XLinkAttributeKey}`;
/**
 * Valid dataset attribute keys are, for example, `xlinkType`, `xlinkHref`.
 * Due to naming conventions, these are accessible as plain attributes as
 * `data-xlink-type` and `data-xlink-href`.
 */
export type XLinkAttributeDataSetKey = `${typeof xLinkPrefix}${Capitalize<XLinkAttributeKey>}`;

const mergeXLinkAttributes = (
  previous: XLinkAttributes | undefined,
  current: XLinkAttributes | undefined,
): XLinkAttributes => ({
  ...previous,
  ...current,
});

export const extractXLinkAttributes = (element: Element): XLinkAttributes =>
  xLinkAttributes
    .map((localName: XLinkAttributeKey): XLinkAttributes | undefined => {
      const attribute = element.getAttributeNodeNS(xLinkNamespaceUri, localName);
      if (attribute) {
        const value = attribute.value;
        // extract: Remove after retrieved.
        element.removeAttributeNode(attribute);
        return {
          [localName]: value,
        };
      }
      return undefined;
    })
    .reduce(mergeXLinkAttributes) ?? {};

export const extractXLinkDataSetEntries = (element: HTMLElement): XLinkAttributes =>
  xLinkAttributes
    .map((localName: XLinkAttributeKey): XLinkAttributes | undefined => {
      const key: XLinkAttributeDataSetKey = `${xLinkPrefix}${capitalize(localName)}`;
      if (key in element.dataset) {
        const value: string | undefined = element.dataset[key];
        // extract: Remove after retrieved.
        // no-dynamic-delete: I do not see any better option here to remove
        // the data attribute without mangling with the attribute name, which
        // again may open a door to XSS attacks if not carefully designed.
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete element.dataset[key];
        // noinspection SuspiciousTypeOfGuard
        if (typeof value === "string") {
          return {
            [localName]: value,
          };
        }
      }
      return undefined;
    })
    .reduce(mergeXLinkAttributes) ?? {};

export const setXLinkAttributes = (element: Element, attributes: XLinkAttributes): void => {
  const { ownerDocument } = element;
  Object.entries(attributes).forEach(([key, value]: [XLinkAttributeKey, string | undefined]) => {
    // We ignore empty values. Thus, only add if non-empty.
    if (value) {
      const qualifiedName: XLinkAttributeQualifiedName = `${xLinkPrefix}:${key}`;
      const xlinkAttribute = ownerDocument.createAttributeNS(xLinkNamespaceUri, qualifiedName);
      xlinkAttribute.value = value;
      const previousNode = element.setAttributeNodeNS(xlinkAttribute);
      if (previousNode) {
        // This may happen if some other data-processing already set a value here.
        console.debug(
          `Overwriting existing attribute node ${describeAttr(previousNode)} by ${describeAttr(xlinkAttribute)}.`,
        );
      }
    }
  });
};

export const setXLinkDataSetEntries = (element: HTMLElement, attributes: XLinkAttributes): void => {
  Object.entries(attributes).forEach(([localName, value]: [XLinkAttributeKey, string | undefined]) => {
    // We ignore empty values. Thus, only add if non-empty.
    if (typeof value === "string") {
      const key: XLinkAttributeDataSetKey = `${xLinkPrefix}${capitalize(localName)}`;
      element.dataset[key] = value;
    }
  });
};
