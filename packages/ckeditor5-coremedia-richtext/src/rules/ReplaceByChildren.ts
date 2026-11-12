import type { RuleConfig } from "@coremedia/ckeditor5-dom-converter";
import type { PriorityString } from "ckeditor5";
import { isElement } from "@coremedia/ckeditor5-dom-support";
import type { Direction } from "./Direction";
import { resolveDirectionToConfig } from "./Direction";

export interface ReplaceByChildrenConfig {
  localName: string;
  /**
   * Direction can go only into one direction. As any information on the
   * removed element is lost, it cannot be bijective.
   */
  direction?: Exclude<Direction, "bijective">;
  priority?: PriorityString;
}

export const defaultReplaceByChildrenConfig: Required<Omit<ReplaceByChildrenConfig, "localName">> = {
  // toData is the typical transformation direction, as it provides less
  // valid elements than the data view.
  direction: "toData",
  priority: "normal",
};
export const replaceByChildren = (config: ReplaceByChildrenConfig): RuleConfig => {
  const { localName, direction, priority } = {
    ...defaultReplaceByChildrenConfig,
    ...config,
  };
  return resolveDirectionToConfig({
    direction,
    toData: () => ({
      id: `replace-${localName}-by-children`,
      imported: (node, { api }): Node => {
        if (!isElement(node) || node.localName !== localName) {
          return node;
        }
        // Fragment will collect children, that are attached later.
        return api.createDocumentFragment();
      },
      priority,
    }),
    toView: () => ({
      id: `replace-${localName}-by-children`,
      imported: (node, { api }): Node => {
        if (!isElement(node) || node.localName !== localName) {
          return node;
        }
        // Fragment will collect children, that are attached later.
        return api.createDocumentFragment();
      },
      priority,
    }),
  });
};
