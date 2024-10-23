import { RuleConfig } from "@coremedia/ckeditor5-dom-converter";
import { PriorityString } from "ckeditor5";
import { Direction, resolveDirectionToConfig } from "./Direction";
import { isElement, removeClass, renameElement } from "@coremedia/ckeditor5-dom-support";

export interface ReplaceElementByElementAndClassConfig {
  viewLocalName: string;
  dataLocalName: string;
  dataReservedClass?: string;
  direction?: Direction;
  priority?: PriorityString;
}

export const applyDefaultReplaceElementByElementAndClassConfig = (
  config: ReplaceElementByElementAndClassConfig,
): Required<ReplaceElementByElementAndClassConfig> => ({
  dataReservedClass: config.viewLocalName,
  direction: "bijective",
  priority: "normal",
  ...config,
});
export const replaceElementByElementAndClass = (config: ReplaceElementByElementAndClassConfig): RuleConfig => {
  const { viewLocalName, dataLocalName, dataReservedClass, direction, priority } =
    applyDefaultReplaceElementByElementAndClassConfig(config);
  return resolveDirectionToConfig({
    direction,
    toData: () => ({
      id: `replace-${viewLocalName}-by-${dataLocalName}.${dataReservedClass}`,
      imported: (node): Node => {
        if (!isElement(node) || node.localName !== viewLocalName) {
          return node;
        }
        const result = renameElement(node, dataLocalName);
        result.classList.add(dataReservedClass);
        return result;
      },
      priority,
    }),
    toView: () => ({
      id: `replace-${dataLocalName}.${dataReservedClass}-by-${viewLocalName}`,
      imported: (node): Node => {
        if (!isElement(node) || node.localName !== dataLocalName || !node.classList.contains(dataReservedClass)) {
          return node;
        }
        const result = renameElement(node, viewLocalName);
        removeClass(result, dataReservedClass);
        return result;
      },
      priority,
    }),
    ruleDefaults: {
      id: `replace-${viewLocalName}-by-${dataLocalName}.${dataReservedClass}-${direction}`,
    },
  });
};
