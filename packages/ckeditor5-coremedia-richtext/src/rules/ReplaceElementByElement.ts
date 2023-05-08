import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/src/Rule";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { Direction, resolveDirectionToConfig } from "./Direction";
import { isElement, renameElement } from "@coremedia/ckeditor5-dom-support/src/Elements";

export interface ReplaceElementByElementConfig {
  viewLocalName: string;
  dataLocalName: string;
  direction?: Direction;
  priority?: PriorityString;
}

export const defaultReplaceElementByElementConfig: Required<
  Omit<ReplaceElementByElementConfig, "viewLocalName" | "dataLocalName">
> = {
  direction: "bijective",
  priority: "normal",
};

export const replaceElementByElement = (config: ReplaceElementByElementConfig): RuleConfig => {
  const { viewLocalName, dataLocalName, direction, priority } = {
    ...defaultReplaceElementByElementConfig,
    ...config,
  };
  return resolveDirectionToConfig({
    direction,
    toData: () => ({
      id: `replace-${viewLocalName}-by-${dataLocalName}`,
      imported: (node): Node => {
        if (!isElement(node) || node.localName !== viewLocalName) {
          return node;
        }
        return renameElement(node, dataLocalName);
      },
      priority,
    }),
    toView: () => ({
      id: `replace-${dataLocalName}-by-${viewLocalName}`,
      imported: (node): Node => {
        if (!isElement(node) || node.localName !== dataLocalName) {
          return node;
        }
        return renameElement(node, viewLocalName);
      },
      priority,
    }),
    ruleDefaults: {
      id: `replace-${viewLocalName}-by-${dataLocalName}-bijective`,
    },
  });
};
