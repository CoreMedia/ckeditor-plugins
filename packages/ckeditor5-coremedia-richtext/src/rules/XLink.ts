import { Direction, resolveDirectionToConfig } from "./Direction";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/Rule";
import { isHTMLElement } from "@coremedia/ckeditor5-dom-support/HTMLElements";

export const xLinkNamespaceUri = "http://www.w3.org/1999/xlink";
export const xLinkPrefix = "xlink";
export const xLinkAttributes = ["type", "href", "role", "title", "show", "actuate"];

export interface RepresentXLinkAttributesAsDataAttributesConfig {
  direction?: Direction;
  priority?: PriorityString;
}

export const defaultRepresentXLinkAttributesAsDataAttributesConfig: Required<RepresentXLinkAttributesAsDataAttributesConfig> =
  {
    direction: "bijective",
    // We use priority low by default, to provide other handlers to decide
    // differently, how to deal with xlink: attributes. Example: For anchors,
    // we want to merge xlink:role and xlink:show into target attribute instead.
    // Thus, this can be perceived as fallback, if no other rule decided to handle
    // them before.
    priority: "low",
  };

export const representXLinkAttributesAsDataAttributes = (
  config?: RepresentXLinkAttributesAsDataAttributesConfig
): RuleConfig => {
  const { direction, priority } = {
    ...defaultRepresentXLinkAttributesAsDataAttributesConfig,
    ...config,
  };
  return resolveDirectionToConfig({
    direction,
    toData: () => ({
      id: "toData-transform-xlink-data-attributes-to-xlink-attributes",
      // Do early, to benefit from richer HTML API.
      prepare: (node): void => {
        if (isHTMLElement(node)) {
          const { ownerDocument } = node;
          for (const key in node.dataset) {
            const match = xLinkAttributes.find((attr) => `${xLinkPrefix}_${attr}` === key);
            if (match) {
              const value = node.dataset[key];
              // no-dynamic-delete: I do not see any better option here to remove
              // the data attribute without mangling with the attribute name, which
              // again may open a door to XSS attacks if not carefully designed.
              // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
              delete node.dataset[key];

              if (value) {
                // We ignore empty values. Thus, only add if non-empty.
                const xlinkAttribute = ownerDocument.createAttributeNS(xLinkNamespaceUri, `${xLinkPrefix}:${match}`);
                xlinkAttribute.value = value;
                node.setAttributeNodeNS(xlinkAttribute);
              }
            }
          }
        }
      },
      priority,
    }),
    toView: () => ({
      id: "toData-transform-xlink-attributes-to-xlink-data-attributes",
      // Do late, to benefit from richer HTML API.
      imported: (node): Node => {
        if (isHTMLElement(node)) {
          const existingAttrs = xLinkAttributes
            .map((attrKey) => node.getAttributeNodeNS(xLinkNamespaceUri, attrKey))
            .filter(Boolean) as Attr[];
          existingAttrs.forEach((attr) => {
            // TODO: `dataset` does not allow hyphens in name. Thus, we may
            //   need to adapt some code. And if we stick to this, also the
            //   old data-processing needs to be adapted accordingly.
            const dataName = `${xLinkPrefix}_${attr.localName}`;
            const dataValue = attr.value;
            node.removeAttributeNode(attr);
            if (dataValue) {
              // Ignore empty values.
              node.dataset[dataName] = dataValue;
            }
          });
        }
        return node;
      },
      priority,
    }),
    ruleDefaults: {
      id: `represent-xlink-attributes-as-data-attributes-${direction}`,
    },
  });
};
