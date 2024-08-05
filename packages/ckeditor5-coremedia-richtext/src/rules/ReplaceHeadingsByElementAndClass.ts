import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/src/Rule";
import { PriorityString } from "ckeditor5";
import { Direction, resolveDirectionToConfig } from "./Direction";
import { isElement, renameElement } from "@coremedia/ckeditor5-dom-support/src/Elements";
const headingRegEx = /^h(?<level>\d)$/;

/**
 * Configuration for mapping HTML headings to representation as given element
 * with reserved class denoting the heading level and vice versa.
 */
export interface ReplaceHeadingsByElementAndClassConfig {
  /**
   * Element name in data.
   */
  dataLocalName?: string;
  /**
   * Prefix for reserved class denoting the heading level in data.
   * Heading level number will be appended.
   */
  dataReservedClassPrefix?: string;
  direction?: Direction;
  /**
   * Priority for mapping.
   */
  priority?: PriorityString;
}

/**
 * Default configuration to apply.
 */
export const defaultReplaceHeadingsByElementAndClassConfig: Required<ReplaceHeadingsByElementAndClassConfig> = {
  dataLocalName: "p",
  dataReservedClassPrefix: "p--heading-",
  direction: "bijective",
  priority: "normal",
};
export const replaceHeadingsByElementAndClass = (config?: ReplaceHeadingsByElementAndClassConfig): RuleConfig => {
  const { dataLocalName, dataReservedClassPrefix, direction, priority } = {
    ...defaultReplaceHeadingsByElementAndClassConfig,
    ...config,
  };
  return resolveDirectionToConfig({
    direction,
    toData: () => ({
      id: `replace-headings-by-${dataLocalName}.${dataReservedClassPrefix}#`,
      imported: (node): Node => {
        if (!isElement(node)) {
          return node;
        }
        const match = node.localName.match(headingRegEx);
        if (match) {
          // @ts-expect-error: https://github.com/microsoft/TypeScript/issues/32098
          const {
            level,
          }: {
            level: string;
          } = match.groups;
          const dataReservedClass = `${dataReservedClassPrefix}${level}`;
          const result = renameElement(node, dataLocalName);
          result.classList.add(dataReservedClass);
          return result;
        }
        return node;
      },
      priority,
    }),
    toView: () => ({
      id: `replace-${dataLocalName}.${dataReservedClassPrefix}#-by-headings`,
      imported: (node): Node => {
        if (!isElement(node) || node.localName !== dataLocalName) {
          return node;
        }
        const match = [...node.classList].find((value) => value.startsWith(dataReservedClassPrefix));
        if (!match) {
          return node;
        }
        const levelClassifier = match.substring(dataReservedClassPrefix.length);
        const level = Number(levelClassifier);
        if (isNaN(level) || level < 1 || level > 6) {
          return node;
        }
        const result = renameElement(node, `h${level}`);
        result.classList.remove(match);
        // Unfortunately, `classList` does not provide this cleanup.
        if (result.classList.length === 0) {
          result.removeAttribute("class");
        }
        return result;
      },
      priority,
    }),
    ruleDefaults: {
      id: `replace-headings-by-${dataLocalName}.${dataReservedClassPrefix}#-${direction}`,
    },
  });
};
